import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';

const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  const sql = await readFile(new URL('../../seeds/001_reference_data.sql', import.meta.url), 'utf8');
  for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
    await connection.query(statement);
  }
  await connection.commit();
  console.log('Applied 001_reference_data.sql');
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
