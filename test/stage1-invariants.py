from pathlib import Path

root = Path(__file__).parents[1]
seed = (root / 'seeds/001_reference_data.sql').read_text()
schema = (root / 'migrations/001_initial_schema.sql').read_text()
approval = (root / 'migrations/002_product_approval_workflow.sql').read_text()
service = (root / 'src/services/loan-products.ts').read_text()
routes = (root / 'src/routes/loan-products.ts').read_text()
seed_runner = (root / 'src/db/seed.ts').read_text()
db_pool = (root / 'src/db/pool.ts').read_text()

# A reference-data re-seed may update labels, but must not override admin activation controls.
currency_upsert = seed.split('INSERT INTO currencies', 1)[1].split('INSERT INTO countries', 1)[0]
assert 'enabled=VALUES(enabled)' not in currency_upsert, 'currency seed must not re-enable a disabled currency'

# Enforce category/type consistency even when writes bypass the API service.
assert 'UNIQUE KEY uq_product_type_category (id, category_id)' in schema
assert 'FOREIGN KEY (product_type_id, category_id) REFERENCES loan_product_types(id, category_id)' in schema
assert 'UNIQUE KEY uq_published_product_version (published_loan_product_id)' in schema

# Enforce one pending approval per product and consistent decision metadata at the DB layer.
assert 'GENERATED ALWAYS AS (CASE WHEN status = \'pending\' THEN loan_product_id ELSE NULL END) STORED' in approval
assert 'UNIQUE KEY uq_pending_approval_product (pending_loan_product_id)' in approval
assert 'FOREIGN KEY (product_version_id, loan_product_id) REFERENCES loan_product_versions(id, loan_product_id)' in approval
assert 'chk_approval_decision_state CHECK' in approval
assert 'chk_rejected_has_reason CHECK' in approval

# Publication must honour version-effective dates and verify transactional state transitions.
assert 'v.effective_from <= CURRENT_TIMESTAMP(6)' in service
assert 'v.effective_until > CURRENT_TIMESTAMP(6)' in service
assert 'versionUpdate.affectedRows !== 1 || productUpdate.affectedRows !== 1' in service
assert 'decisionUpdate.affectedRows !== 1' in service

# Rejections must have an actionable reason and IDs must be canonical positive integers.
assert 'A rejection reason of at least 5 characters is required' in routes
assert "if (!/^[1-9]\\d*$/.test(value)) return null;" in routes

migration_runner = (root / 'src/db/migrate.ts').read_text()
assert 'SELECT GET_LOCK(?, 30)' in migration_runner
assert 'SELECT RELEASE_LOCK(?)' in migration_runner
assert 'migrationLockAcquired' in migration_runner

assert 'await connection.beginTransaction();' in seed_runner and 'await connection.commit();' in seed_runner and 'await connection.rollback();' in seed_runner
assert "['mysql:', 'mysql2:'].includes(databaseUrl.protocol)" in db_pool
print('PASS: seed safety/transactions, product/category integrity, publication uniqueness, approval uniqueness, decision integrity, publication timing and API validation.')
