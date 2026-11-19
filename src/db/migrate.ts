import { readdir, readFile } from 'node:fs/promises';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from './pool.js';

const connection = await pool.getConnection();
const migrationLockName = 'loan_platform_schema_migrations';
let migrationLockAcquired = false;
try {
  // MySQL advisory locks prevent two application instances from applying the
  // same migration concurrently during a rolling deployment.
  const [lockRows] = await connection.query<RowDataPacket[]>(
    'SELECT GET_LOCK(?, 30) AS acquired', [migrationLockName]);
  if (Number(lockRows[0]?.acquired) !== 1) {
    throw new Error('Could not acquire the database migration lock within 30 seconds');
  }
  migrationLockAcquired = true;

  await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(120) PRIMARY KEY,
    applied_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
  ) ENGINE=InnoDB`);
  const migrationDirectory = new URL('../../migrations/', import.meta.url);
  const files = (await readdir(migrationDirectory)).filter((file) => /^\d+_[a-z0-9_-]+\.sql$/i.test(file)).sort();
  for (const file of files) {
    const [applied] = await connection.execute<RowDataPacket[]>(
      'SELECT version FROM schema_migrations WHERE version = ? LIMIT 1', [file]);
    if (applied.length) continue;
    const sql = await readFile(new URL(file, migrationDirectory), 'utf8');
    // Migration files contain ordinary DDL/DML only; no stored-program delimiter blocks.
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
      await connection.query(statement);
    }
    await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', [file]);
    console.log(`Applied ${file}`);
  }
} finally {
  try {
    if (migrationLockAcquired) {
      await connection.query('SELECT RELEASE_LOCK(?)', [migrationLockName]);
    }
  } finally {
    connection.release();
    await pool.end();
  }
}
