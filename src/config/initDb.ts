import fs from 'fs';
import path from 'path';
import db from './database';

// Path to schema SQL file
const schemaPath = path.join(__dirname, 'schema.sql');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read SQL schema
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute SQL schema
    await db.query(sql);
    
    console.log('✅ Database schema created successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;