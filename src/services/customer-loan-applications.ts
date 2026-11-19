import { randomUUID } from 'node:crypto';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool.js';\nimport { decryptCustomerProfile } from './customer-profile-crypto.js';
import type { CustomerContext } from './customer-identity.js';
import type { CreateCustomerLoanApplicationInput } from '../domain/customer-loan-application.js';

export class CustomerApplicationError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 409) {
    super(message); this.name = 'CustomerApplicationError'; this.statusCode = statusCode;
  }
}

async function audit(connection: PoolConnection, customerId: string, applicationId: string,
  eventType: string, fromStatus: string | null, toStatus: string | null, metadata: object = {}) {
  await connection.execute(
    `INSERT INTO customer_loan_application_events
      (application_id, customer_id, actor_type, actor_id, event_type, from_status, to_status, metadata_json)
     VALUES (?, ?, 'customer', ?, ?, ?, ?, ?)`,
    [applicationId, customerId, `customer:${customerId}`, eventType, fromStatus, toStatus, JSON.stringify(metadata)],
  );
  await connection.execute(
    `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata_json)
     VALUES (?, ?, 'customer_loan_application', ?, ?)`,
    [`customer:${customerId}`, eventType, applicationId, JSON.stringify(metadata)],
  );
}

export async function createCustomerApplication(context: CustomerContext, input: CreateCustomerLoanApplicationInput, encryptionKeyHex: string) {
  const connection = await pool.getConnection();
  const id = randomUUID();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT p.id, p.code, p.name, p.status AS product_status, v.id AS version_id,
              v.version_number, v.status AS version_status, v.currency_code,
              v.minimum_amount, v.maximum_amount, v.minimum_duration_days, v.maximum_duration_days,
              v.interest_model, v.annual_interest_rate_bps, v.repayment_frequency,
              v.requires_collateral, v.requires_guarantor, v.risk_review_required,
              v.effective_from, v.effective_until
         FROM loan_products p
         JOIN loan_product_versions v ON v.loan_product_id = p.id AND v.status = 'published'
        WHERE p.id = ? AND p.status = 'active' AND v.currency_code = ?
          AND (v.effective_from IS NULL OR v.effective_from <= CURRENT_TIMESTAMP(6))
          AND (v.effective_until IS NULL OR v.effective_until > CURRENT_TIMESTAMP(6))
        LIMIT 1 FOR SHARE`,
      [input.productId, input.currencyCode],
    );
    const product = rows[0];
    if (!product) throw new CustomerApplicationError('This loan product is not currently available in the selected currency', 422);

    const [profileRows] = await connection.execute<RowDataPacket[]>(
      'SELECT encrypted_profile FROM customer_profiles WHERE customer_id = ? FOR SHARE', [context.customerId]);
    if (!profileRows[0]) throw new CustomerApplicationError('Customer profile must be completed before applying', 409);
    const profile = decryptCustomerProfile(Buffer.from(profileRows[0].encrypted_profile), encryptionKeyHex, context.customerId);
    const profile = decryptCustomerProfile(Buffer.from(profileRows[0].encrypted_profile), encryptionKeyHex, context.customerId);

    const [scopeRows] = await connection.execute<RowDataPacket[]>(
      `SELECT pc.country_code FROM loan_product_countries pc
         JOIN countries co ON co.code = pc.country_code AND co.enabled = 1
         JOIN country_currencies cc ON cc.country_code = pc.country_code AND cc.currency_code = ? AND cc.enabled = 1
        WHERE pc.loan_product_id = ? AND pc.enabled = 1`,
      [input.currencyCode, input.productId]);
    if (!scopeRows.some(row => String(row.country_code) === profile.declaredResidenceCountryCode)) {\n      throw new CustomerApplicationError('This product is not enabled for your declared residence country and currency', 422);\n    }

    const scaledAmount = (value: string) => {
      const [whole, fraction = ''] = value.split('.');
      return BigInt(whole!) * 10_000n + BigInt((fraction + '0000').slice(0, 4));
    };
    const amount = scaledAmount(input.requestedAmount);
    const min = scaledAmount(String(product.minimum_amount));
    const max = scaledAmount(String(product.maximum_amount));
    if (amount < min || amount > max) throw new CustomerApplicationError('Requested amount is outside the published product limits', 422);
    if (input.requestedDurationDays < Number(product.minimum_duration_days) ||
        input.requestedDurationDays > Number(product.maximum_duration_days)) {
      throw new CustomerApplicationError('Requested duration is outside the published product limits', 422);
    }

    const snapshot = {
      productId: Number(product.id), productCode: String(product.code), productName: String(product.name),
      productVersionId: Number(product.version_id), versionNumber: Number(product.version_number),
      currencyCode: String(product.currency_code), minimumAmount: String(product.minimum_amount),
      maximumAmount: String(product.maximum_amount), minimumDurationDays: Number(product.minimum_duration_days),
      maximumDurationDays: Number(product.maximum_duration_days), interestModel: String(product.interest_model),
      annualInterestRateBps: Number(product.annual_interest_rate_bps),
      repaymentFrequency: String(product.repayment_frequency), requiresCollateral: Boolean(product.requires_collateral),
      requiresGuarantor: Boolean(product.requires_guarantor), riskReviewRequired: Boolean(product.risk_review_required),
      effectiveFrom: product.effective_from, effectiveUntil: product.effective_until,
    };
    await connection.execute(
      `INSERT INTO customer_loan_applications
        (id, customer_id, loan_product_id, product_version_id, status, requested_amount,
         currency_code, requested_duration_days, product_terms_snapshot, applicant_declaration_version)
       VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)`,
      [id, context.customerId, product.id, product.version_id, input.requestedAmount,
       input.currencyCode, input.requestedDurationDays, JSON.stringify(snapshot), input.applicantDeclarationVersion],
    );
    await audit(connection, context.customerId, id, 'customer.application.created', null, 'draft', {
      productVersion: snapshot.versionNumber, currency: input.currencyCode,
    });
    await connection.commit();
    return { id, status: 'draft', requestedAmount: input.requestedAmount, currencyCode: input.currencyCode,
      requestedDurationDays: input.requestedDurationDays, product: snapshot };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function submitCustomerApplication(context: CustomerContext, applicationId: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, status FROM customer_loan_applications WHERE id = ? AND customer_id = ? FOR UPDATE',
      [applicationId, context.customerId]);
    const row = rows[0];
    if (!row) throw new CustomerApplicationError('Application not found', 404);
    if (row.status !== 'draft') throw new CustomerApplicationError('Only draft applications can be submitted');
    const [update] = await connection.execute<ResultSetHeader>(
      `UPDATE customer_loan_applications SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP(6)
        WHERE id = ? AND customer_id = ? AND status = 'draft'`, [applicationId, context.customerId]);
    if (update.affectedRows !== 1) throw new CustomerApplicationError('Application state changed; refresh and retry');
    await audit(connection, context.customerId, applicationId, 'customer.application.submitted', 'draft', 'submitted');
    await connection.commit();
    return { id: applicationId, status: 'submitted' };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function withdrawCustomerApplication(context: CustomerContext, applicationId: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, status FROM customer_loan_applications WHERE id = ? AND customer_id = ? FOR UPDATE',
      [applicationId, context.customerId]);
    const row = rows[0];
    if (!row) throw new CustomerApplicationError('Application not found', 404);
    if (!['draft', 'submitted', 'awaiting_documents'].includes(String(row.status))) {
      throw new CustomerApplicationError('This application can no longer be withdrawn');
    }
    const [update] = await connection.execute<ResultSetHeader>(
      `UPDATE customer_loan_applications SET status = 'withdrawn'
        WHERE id = ? AND customer_id = ? AND status = ?`, [applicationId, context.customerId, row.status]);
    if (update.affectedRows !== 1) throw new CustomerApplicationError('Application state changed; refresh and retry');
    await audit(connection, context.customerId, applicationId, 'customer.application.withdrawn', String(row.status), 'withdrawn');
    await connection.commit();
    return { id: applicationId, status: 'withdrawn' };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function listCustomerApplications(context: CustomerContext) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, status, requested_amount, currency_code, requested_duration_days,
            product_terms_snapshot, submitted_at, created_at, updated_at
       FROM customer_loan_applications WHERE customer_id = ?
      ORDER BY created_at DESC LIMIT 100`, [context.customerId]);
  return rows.map(row => ({ ...row, product_terms_snapshot: typeof row.product_terms_snapshot === 'string'
    ? JSON.parse(row.product_terms_snapshot) : row.product_terms_snapshot }));
}

export async function getCustomerApplication(context: CustomerContext, applicationId: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, status, requested_amount, currency_code, requested_duration_days,
            product_terms_snapshot, applicant_declaration_version, submitted_at, created_at, updated_at
       FROM customer_loan_applications WHERE id = ? AND customer_id = ? LIMIT 1`,
    [applicationId, context.customerId]);
  if (!rows[0]) throw new CustomerApplicationError('Application not found', 404);
  const [events] = await pool.execute<RowDataPacket[]>(
    `SELECT event_type, from_status, to_status, created_at
       FROM customer_loan_application_events WHERE application_id = ? AND customer_id = ?
      ORDER BY created_at ASC, id ASC`, [applicationId, context.customerId]);
  const row = rows[0];
  return { ...row, product_terms_snapshot: typeof row.product_terms_snapshot === 'string'
    ? JSON.parse(row.product_terms_snapshot) : row.product_terms_snapshot, timeline: events };
}
