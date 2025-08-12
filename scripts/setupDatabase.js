/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'golden_arrow';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);

async function ensureDatabase() {
  // Connect to default 'postgres' database to create target database if needed
  const adminClient = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: 'postgres',
    password: DB_PASSWORD,
    port: DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await adminClient.connect();
  try {
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );
    if (res.rowCount === 0) {
      console.log(`📦 Creating database ${DB_NAME}...`);
      await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log('✅ Database created');
    } else {
      console.log('ℹ️ Database already exists');
    }
  } finally {
    await adminClient.end();
  }
}

async function applySchema() {
  const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  try {
    console.log('🔄 Applying schema...');
    await client.query(sql);
    console.log('✅ Schema applied successfully');
  } finally {
    await client.end();
  }
}

(async function main() {
  try {
    console.log('🚀 Setting up PostgreSQL database...');
    await ensureDatabase();
    await applySchema();
    console.log('🎉 Database setup completed');
  } catch (err) {
    console.error('❌ Error setting up database:', err);
    process.exit(1);
  }
})();