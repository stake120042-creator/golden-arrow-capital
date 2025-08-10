import { Pool } from 'pg';
import dotenv from 'dotenv';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Load environment variables (only in Node.js)
if (!isBrowser) {
  dotenv.config();
}

// Create a mock database interface for client-side
const createMockDb = () => {
  return {
    query: async (text: string, params?: any[]) => {
      console.warn('🔶 Client-side DB query attempted but ignored:', text);
      // Return a mock result
      return { rows: [], rowCount: 0 };
    },
    pool: null,
  };
};

// Create actual database pool for server-side
const createRealDb = () => {
  // PostgreSQL connection pool configuration
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'golden_arrow',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 10000, // How long to wait for a connection
  });

  // Test database connection
  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(-1);
    }
  });

  return {
    query: (text: string, params?: any[]) => pool.query(text, params),
    pool,
  };
};

// Export the appropriate database implementation based on environment
const db = isBrowser ? createMockDb() : createRealDb();

export default db;