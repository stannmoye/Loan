import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL ?? '');
assert.equal(url.protocol, 'mysql:', 'DATABASE_URL must use mysql://');
const db = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  decimalNumbers: false,
});

const expectReject = async (work, label) => {
  let rejected = false;
  try { await work(); } catch { rejected = true; }
  assert.equal(rejected, true, `${label} must be rejected by MySQL`);
};

try {
  const [[{ categories }]] = await db.query('SELECT COUNT(*) AS categories FROM loan_categories');
  const [[{ productTypes }]] = await db.query('SELECT COUNT(*) AS productTypes FROM loan_product_types');
  assert.equal(Number(categories), 19, 'seed must contain all 19 loan categories');
  assert.equal(Number(productTypes), 66, 'seed must contain all 66 loan product types');

  const [[{ disabledCorridors }]] = await db.query('SELECT COUNT(*) AS disabledCorridors FROM country_currencies WHERE enabled = 0');
  assert.ok(Number(disabledCorridors) > 0, 'country/currency corridors must remain disabled by default');

  const [[category]] = await db.query("SELECT id FROM loan_categories WHERE code = 'personal-consumer'");
  const [[type]] = await db.query("SELECT id FROM loan_product_types WHERE code = 'personal-loan' AND category_id = ?", [category.id]);
  const [productResult] = await db.execute(
    `INSERT INTO loan_products (code,name,category_id,product_type_id,status,created_by)
     VALUES ('IT_PRODUCT_001','Integration test product',?,?,'draft','ci-maker')`, [category.id, type.id]);
  const productId = productResult.insertId;

  const insertVersion = async (versionNumber) => db.execute(
    `INSERT INTO loan_product_versions
      (loan_product_id,version_number,status,currency_code,minimum_amount,maximum_amount,
       minimum_duration_days,maximum_duration_days,interest_model,annual_interest_rate_bps,
       repayment_frequency,risk_review_required,created_by)
     VALUES (?,?,'published','USD',100,1000,30,365,'fixed',1200,'monthly',TRUE,'ci-maker')`,
    [productId, versionNumber]);
  await insertVersion(1);
  await expectReject(() => insertVersion(2), 'a second published version for the same product');

  const [[version]] = await db.query('SELECT id FROM loan_product_versions WHERE loan_product_id = ? AND version_number = 1', [productId]);
  await db.execute(
    `INSERT INTO loan_product_approval_requests (loan_product_id,product_version_id,submitted_by)
     VALUES (?,?,'ci-maker')`, [productId, version.id]);
  await expectReject(() => db.execute(
    `INSERT INTO loan_product_approval_requests (loan_product_id,product_version_id,submitted_by)
     VALUES (?,?,'ci-maker')`, [productId, version.id]), 'a second pending approval for the same product');

  const [[{ beforeRollback }]] = await db.query("SELECT COUNT(*) AS beforeRollback FROM audit_events WHERE actor_id = 'ci-rollback'");
  await db.beginTransaction();
  await db.execute(
    `INSERT INTO audit_events (actor_id,action,entity_type,entity_id,metadata_json)
     VALUES ('ci-rollback','integration.rollback','test','1',JSON_OBJECT('test',TRUE))`);
  await db.rollback();
  const [[{ afterRollback }]] = await db.query("SELECT COUNT(*) AS afterRollback FROM audit_events WHERE actor_id = 'ci-rollback'");
  assert.equal(Number(afterRollback), Number(beforeRollback), 'audit write must roll back with its transaction');


  // Customer identity/profile tables are exercised using synthetic identifiers.
  // All inserts are rolled back; no real customer or provider identity is used.
  const customerId = randomUUID();
  const sessionId = randomUUID();
  const issuer = 'https://identity.integration.example/';
  const externalSubject = 'ci-subject-' + randomUUID();
  const externalSession = 'ci-session-' + randomUUID();
  const sessionHash = createHash('sha256').update(issuer).update('\0').update(externalSession).digest('hex');

  await db.beginTransaction();
  try {
    await db.execute("INSERT INTO customer_accounts (id, status) VALUES (?, 'active')", [customerId]);
    await db.execute(
      'INSERT INTO customer_identity_links (customer_id, issuer, external_subject) VALUES (?, ?, ?)',
      [customerId, issuer, externalSubject],
    );

    const caseSubjectCustomerId = randomUUID();
    const caseIssuerCustomerId = randomUUID();
    await db.execute("INSERT INTO customer_accounts (id, status) VALUES (?, 'active'), (?, 'active')", [
      caseSubjectCustomerId, caseIssuerCustomerId,
    ]);
    await db.execute(
      'INSERT INTO customer_identity_links (customer_id, issuer, external_subject) VALUES (?, ?, ?)',
      [caseSubjectCustomerId, issuer, externalSubject.toUpperCase()],
    );
    await db.execute(
      'INSERT INTO customer_identity_links (customer_id, issuer, external_subject) VALUES (?, ?, ?)',
      [caseIssuerCustomerId, issuer.toUpperCase(), externalSubject],
    );
    const [[{ caseSensitiveMappings }]] = await db.query(
      'SELECT COUNT(*) AS caseSensitiveMappings FROM customer_identity_links WHERE (issuer = ? AND external_subject = ?) OR (issuer = ? AND external_subject = ?)',
      [issuer, externalSubject.toUpperCase(), issuer.toUpperCase(), externalSubject],
    );
    assert.equal(Number(caseSensitiveMappings), 2, 'issuer and subject matching must be case-sensitive');
    await expectReject(
      () => db.execute(
        'INSERT INTO customer_identity_links (customer_id, issuer, external_subject) VALUES (?, ?, ?)',
        [customerId, issuer, externalSubject],
      ),
      'a duplicate external identity mapping',
    );

    await db.execute(
      'INSERT INTO customer_profiles (customer_id, encrypted_profile, encryption_version) VALUES (?, ?, 1)',
      [customerId, Buffer.from('synthetic-aes-gcm-ciphertext')],
    );
    await db.execute(
      'INSERT INTO customer_sessions (id, customer_id, session_key_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP(6), INTERVAL 10 MINUTE))',
      [sessionId, customerId, sessionHash],
    );
    await expectReject(
      () => db.execute(
        'INSERT INTO customer_sessions (id, customer_id, session_key_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP(6), INTERVAL 10 MINUTE))',
        [randomUUID(), customerId, sessionHash],
      ),
      'a duplicate customer provider-session mapping',
    );

    await db.execute(
      "INSERT INTO customer_consents (customer_id, session_id, consent_type, document_version) VALUES (?, ?, 'privacy_notice', 'ci-privacy-v1')",
      [customerId, sessionId],
    );
    await db.execute(
      "INSERT INTO customer_consents (customer_id, session_id, consent_type, document_version) VALUES (?, ?, 'terms_of_service', 'ci-terms-v1')",
      [customerId, sessionId],
    );
    await expectReject(
      () => db.execute(
        "INSERT INTO customer_consents (customer_id, session_id, consent_type, document_version) VALUES (?, ?, 'privacy_notice', 'ci-privacy-v1')",
        [customerId, sessionId],
      ),
      'a duplicate accepted consent document version',
    );

    await db.execute(
      "INSERT INTO customer_security_events (customer_id, event_type, metadata_json) VALUES (?, 'customer.test.onboarding', JSON_OBJECT('source','integration-test'))",
      [customerId],
    );
    await db.execute(
      "INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata_json) VALUES (?, 'customer.test.onboarding', 'customer_account', ?, JSON_OBJECT('synthetic',TRUE))",
      ['customer:' + customerId, customerId],
    );

    const [[{ accountCount }]] = await db.query(
      'SELECT COUNT(*) AS accountCount FROM customer_accounts WHERE id = ? AND status = ?',
      [customerId, 'active'],
    );
    const [[{ consentCount }]] = await db.query(
      'SELECT COUNT(*) AS consentCount FROM customer_consents WHERE customer_id = ?',
      [customerId],
    );
    const [[{ eventCount }]] = await db.query(
      'SELECT COUNT(*) AS eventCount FROM customer_security_events WHERE customer_id = ?',
      [customerId],
    );
    assert.equal(Number(accountCount), 1, 'customer account must be persisted');
    assert.equal(Number(consentCount), 2, 'privacy and terms acknowledgements must be independently recorded');
    assert.equal(Number(eventCount), 1, 'customer security events must be persisted');

    await db.execute(
      'UPDATE customer_sessions SET revoked_at = CURRENT_TIMESTAMP(6) WHERE id = ? AND customer_id = ?',
      [sessionId, customerId],
    );
    const [[{ revokedCount }]] = await db.query(
      'SELECT COUNT(*) AS revokedCount FROM customer_sessions WHERE id = ? AND revoked_at IS NOT NULL',
      [sessionId],
    );
    assert.equal(Number(revokedCount), 1, 'customer sessions must support revocation');

    await db.rollback();
  } catch (error) {
    await db.rollback();
    throw error;
  }

  console.log('MySQL 8.4 integration checks passed: catalogue seed, disabled corridors, product approval constraints, rollback, case-sensitive customer issuer/subject mappings, encrypted-profile storage, customer sessions, consent history and security events.');
} finally {
  await db.end();
}
