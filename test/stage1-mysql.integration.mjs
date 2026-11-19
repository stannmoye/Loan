import assert from 'node:assert/strict';
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

  console.log('MySQL 8.4 integration checks passed: seed counts, disabled corridors, published-version uniqueness, pending-approval uniqueness, and transaction rollback.');
} finally {
  await db.end();
}
