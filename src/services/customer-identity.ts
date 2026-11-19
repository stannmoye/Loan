import { createHash, randomUUID } from 'node:crypto';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type {
  CustomerOnboardingInput,
  CustomerProfile,
  UpdateCustomerProfileInput,
} from '../domain/customer-account.js';
import type { CustomerIdentity } from '../plugins/customer-auth.js';
import { pool } from '../db/pool.js';
import { decryptCustomerProfile, encryptCustomerProfile } from './customer-profile-crypto.js';

export class CustomerAccountError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 409) {
    super(message);
    this.name = 'CustomerAccountError';
    this.statusCode = statusCode;
  }
}

export type CustomerContext = {
  customerId: string;
  currentSessionId: string;
};

export type CustomerConsentVersions = {
  privacyNoticeVersion: string;
  termsOfServiceVersion: string;
};

function sessionHash(identity: CustomerIdentity): string {
  return createHash('sha256')
    .update(identity.issuer)
    .update('\0')
    .update(identity.sessionId)
    .digest('hex');
}

function customerActor(customerId: string): string {
  return 'customer:' + customerId;
}

async function writeSecurityEvent(
  connection: PoolConnection,
  customerId: string,
  eventType: string,
  metadata: Record<string, string | number | boolean | null>,
): Promise<void> {
  await connection.execute(
    'INSERT INTO customer_security_events (customer_id, event_type, metadata_json) VALUES (?, ?, ?)',
    [customerId, eventType, JSON.stringify(metadata)],
  );
}

async function writeAudit(
  connection: PoolConnection,
  customerId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, string | number | boolean | null>,
): Promise<void> {
  await connection.execute(
    'INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?)',
    [customerActor(customerId), action, entityType, entityId, JSON.stringify(metadata)],
  );
}

async function createOrResumeCustomerAccountAttempt(
  identity: CustomerIdentity,
  input: CustomerOnboardingInput,
  consentVersions: CustomerConsentVersions,
  encryptionKeyHex: string,
): Promise<{ customerId: string; sessionId: string; created: boolean }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [identityRows] = await connection.execute<RowDataPacket[]>(
      'SELECT ca.id AS customer_id, ca.status AS account_status FROM customer_identity_links il JOIN customer_accounts ca ON ca.id = il.customer_id WHERE il.issuer = ? AND il.external_subject = ? LIMIT 1 FOR UPDATE',
      [identity.issuer, identity.subject],
    );

    let customerId: string;
    let created = false;

    if (!identityRows[0]) {
      customerId = randomUUID();

      await connection.execute(
        'INSERT INTO customer_accounts (id, status) VALUES (?, \'active\')',
        [customerId],
      );
      await connection.execute(
        'INSERT INTO customer_identity_links (customer_id, issuer, external_subject) VALUES (?, ?, ?)',
        [customerId, identity.issuer, identity.subject],
      );

      const initialProfile: CustomerProfile = {
        email: identity.email,
        emailVerified: true,
        displayName: input.displayName,
        declaredResidenceCountryCode: input.declaredResidenceCountryCode,
        preferredLocale: input.preferredLocale,
      };
      const encryptedProfile = encryptCustomerProfile(initialProfile, encryptionKeyHex, customerId);
      await connection.execute(
        'INSERT INTO customer_profiles (customer_id, encrypted_profile, encryption_version) VALUES (?, ?, 1)',
        [customerId, encryptedProfile],
      );
      created = true;
    } else {
      customerId = String(identityRows[0].customer_id);
      if (identityRows[0].account_status !== 'active') {
        throw new CustomerAccountError('Customer account is not active', 403);
      }
      const [profileRows] = await connection.execute<RowDataPacket[]>(
        'SELECT customer_id FROM customer_profiles WHERE customer_id = ? FOR UPDATE',
        [customerId],
      );
      if (!profileRows[0]) {
        throw new CustomerAccountError('Customer profile requires assisted recovery', 409);
      }
    }

    const hash = sessionHash(identity);
    const [sessionRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, revoked_at, expires_at FROM customer_sessions WHERE customer_id = ? AND session_key_hash = ? LIMIT 1 FOR UPDATE',
      [customerId, hash],
    );

    let sessionId: string;
    if (sessionRows[0]) {
      if (sessionRows[0].revoked_at !== null) {
        throw new CustomerAccountError('This customer session has been revoked', 401);
      }
      sessionId = String(sessionRows[0].id);
      await connection.execute(
        'UPDATE customer_sessions SET expires_at = ?, last_seen_at = CURRENT_TIMESTAMP(6) WHERE id = ? AND revoked_at IS NULL',
        [identity.expiresAt, sessionId],
      );
    } else {
      sessionId = randomUUID();
      await connection.execute(
        'INSERT INTO customer_sessions (id, customer_id, session_key_hash, expires_at, last_seen_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(6))',
        [sessionId, customerId, hash, identity.expiresAt],
      );
      if (!created) {
        await writeSecurityEvent(connection, customerId, 'customer.session.started', {
          sessionRecordId: sessionId,
        });
        await writeAudit(connection, customerId, 'customer.session.started', 'customer_session', sessionId, {});
      }
    }

    const consentRows: Array<{ type: 'privacy_notice' | 'terms_of_service'; version: string }> = [
      { type: 'privacy_notice', version: consentVersions.privacyNoticeVersion },
      { type: 'terms_of_service', version: consentVersions.termsOfServiceVersion },
    ];

    for (const consent of consentRows) {
      const [insertResult] = await connection.execute<ResultSetHeader>(
        'INSERT IGNORE INTO customer_consents (customer_id, session_id, consent_type, document_version) VALUES (?, ?, ?, ?)',
        [customerId, sessionId, consent.type, consent.version],
      );
      if (insertResult.affectedRows === 1) {
        await writeSecurityEvent(connection, customerId, 'customer.consent.accepted', {
          consentType: consent.type,
          documentVersion: consent.version,
        });
        await writeAudit(connection, customerId, 'customer.consent.accepted', 'customer_consent', customerId, {
          consentType: consent.type,
          documentVersion: consent.version,
        });
      }
    }

    if (created) {
      await writeSecurityEvent(connection, customerId, 'customer.account.created', {
        identityIssuer: identity.issuer,
      });
      await writeAudit(connection, customerId, 'customer.account.created', 'customer_account', customerId, {
        identityIssuer: identity.issuer,
        profileEncryptionVersion: 1,
      });
    }

    await connection.commit();
    return { customerId, sessionId, created };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * A unique-identity race can occur when a browser retries onboarding while
 * another request is committing the same verified identity. Retry once after
 * the losing transaction rolls back. The unique database key remains the
 * authority preventing duplicate customer accounts.
 */
export async function onboardCustomer(
  identity: CustomerIdentity,
  input: CustomerOnboardingInput,
  consentVersions: CustomerConsentVersions,
  encryptionKeyHex: string,
): Promise<{ customerId: string; sessionId: string; created: boolean }> {
  try {
    return await createOrResumeCustomerAccountAttempt(identity, input, consentVersions, encryptionKeyHex);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== 'ER_DUP_ENTRY' && code !== 'ER_LOCK_DEADLOCK') throw error;
    return createOrResumeCustomerAccountAttempt(identity, input, consentVersions, encryptionKeyHex);
  }
}

export async function findActiveCustomerContext(identity: CustomerIdentity): Promise<CustomerContext> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT ca.id AS customer_id, ca.status AS account_status, cs.id AS session_id FROM customer_identity_links il JOIN customer_accounts ca ON ca.id = il.customer_id JOIN customer_sessions cs ON cs.customer_id = ca.id AND cs.session_key_hash = ? AND cs.revoked_at IS NULL WHERE il.issuer = ? AND il.external_subject = ? LIMIT 1',
    [sessionHash(identity), identity.issuer, identity.subject],
  );

  if (!rows[0]) {
    throw new CustomerAccountError('Customer account or active session was not found', 401);
  }
  if (rows[0].account_status !== 'active') {
    throw new CustomerAccountError('Customer account is not active', 403);
  }

  const context = {
    customerId: String(rows[0].customer_id),
    currentSessionId: String(rows[0].session_id),
  };

  await pool.execute(
    'UPDATE customer_sessions SET expires_at = ?, last_seen_at = CASE WHEN last_seen_at < CURRENT_TIMESTAMP(6) - INTERVAL 5 MINUTE THEN CURRENT_TIMESTAMP(6) ELSE last_seen_at END WHERE id = ? AND revoked_at IS NULL',
    [identity.expiresAt, context.currentSessionId],
  );

  return context;
}

export async function getCustomerProfile(
  context: CustomerContext,
  encryptionKeyHex: string,
) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT ca.status, ca.created_at, p.encrypted_profile FROM customer_accounts ca JOIN customer_profiles p ON p.customer_id = ca.id WHERE ca.id = ? LIMIT 1',
    [context.customerId],
  );
  if (!rows[0]) throw new CustomerAccountError('Customer profile was not found', 404);
  if (rows[0].status !== 'active') throw new CustomerAccountError('Customer account is not active', 403);

  const profile = decryptCustomerProfile(
    Buffer.from(rows[0].encrypted_profile as Buffer),
    encryptionKeyHex,
    context.customerId,
  );
  const [consents] = await pool.execute<RowDataPacket[]>(
    'SELECT consent_type, document_version, accepted_at FROM customer_consents WHERE customer_id = ? ORDER BY accepted_at ASC',
    [context.customerId],
  );

  return {
    customerId: context.customerId,
    status: String(rows[0].status),
    createdAt: rows[0].created_at,
    profile,
    consents: consents.map((item) => ({
      type: String(item.consent_type),
      documentVersion: String(item.document_version),
      acceptedAt: item.accepted_at,
    })),
  };
}

export async function updateCustomerProfile(
  context: CustomerContext,
  input: UpdateCustomerProfileInput,
  encryptionKeyHex: string,
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT ca.status, p.encrypted_profile FROM customer_accounts ca JOIN customer_profiles p ON p.customer_id = ca.id WHERE ca.id = ? LIMIT 1 FOR UPDATE',
      [context.customerId],
    );
    if (!rows[0]) throw new CustomerAccountError('Customer profile was not found', 404);
    if (rows[0].status !== 'active') throw new CustomerAccountError('Customer account is not active', 403);

    const previous = decryptCustomerProfile(
      Buffer.from(rows[0].encrypted_profile as Buffer),
      encryptionKeyHex,
      context.customerId,
    );
    const updated: CustomerProfile = {
      email: previous.email,
      emailVerified: previous.emailVerified,
      displayName: input.displayName ?? previous.displayName,
      declaredResidenceCountryCode: input.declaredResidenceCountryCode ?? previous.declaredResidenceCountryCode,
      preferredLocale: input.preferredLocale ?? previous.preferredLocale,
    };
    const encryptedProfile = encryptCustomerProfile(updated, encryptionKeyHex, context.customerId);
    await connection.execute(
      'UPDATE customer_profiles SET encrypted_profile = ?, encryption_version = 1 WHERE customer_id = ?',
      [encryptedProfile, context.customerId],
    );

    const changedFields = Object.keys(input).sort();
    await writeSecurityEvent(connection, context.customerId, 'customer.profile.updated', {
      changedFields: changedFields.join(','),
    });
    await writeAudit(connection, context.customerId, 'customer.profile.updated', 'customer_profile', context.customerId, {
      changedFields: changedFields.join(','),
    });
    await connection.commit();
    return updated;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listCustomerSessions(context: CustomerContext) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, created_at, last_seen_at, expires_at, revoked_at FROM customer_sessions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20',
    [context.customerId],
  );
  return rows.map((row) => ({
    id: String(row.id),
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    current: String(row.id) === context.currentSessionId,
  }));
}

export async function revokeCustomerSession(
  context: CustomerContext,
  targetSessionId: string,
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, revoked_at FROM customer_sessions WHERE id = ? AND customer_id = ? LIMIT 1 FOR UPDATE',
      [targetSessionId, context.customerId],
    );
    if (!rows[0]) throw new CustomerAccountError('Customer session was not found', 404);

    let revoked = false;
    if (rows[0].revoked_at === null) {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE customer_sessions SET revoked_at = CURRENT_TIMESTAMP(6) WHERE id = ? AND customer_id = ? AND revoked_at IS NULL',
        [targetSessionId, context.customerId],
      );
      revoked = result.affectedRows === 1;
      if (revoked) {
        await writeSecurityEvent(connection, context.customerId, 'customer.session.revoked', {
          sessionRecordId: targetSessionId,
          currentSession: targetSessionId === context.currentSessionId,
        });
        await writeAudit(connection, context.customerId, 'customer.session.revoked', 'customer_session', targetSessionId, {
          currentSession: targetSessionId === context.currentSessionId,
        });
      }
    }

    await connection.commit();
    return {
      sessionId: targetSessionId,
      revoked,
      currentSession: targetSessionId === context.currentSessionId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
