import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const databaseUrl = new URL(env.DATABASE_URL);
if (!['mysql:', 'mysql2:'].includes(databaseUrl.protocol)) {
  throw new Error('DATABASE_URL must use the mysql:// or mysql2:// protocol');
}
const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));
if (!databaseUrl.hostname || !databaseName) {
  throw new Error('DATABASE_URL must include a database host and database name');
}
const connectionOptions = {
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  decimalNumbers: false,
  timezone: 'Z',
  multipleStatements: false,
  ...(env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: true } } : {}),
};

export const pool = mysql.createPool(connectionOptions);
