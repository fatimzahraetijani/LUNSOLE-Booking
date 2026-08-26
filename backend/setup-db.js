const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔄 Initializing database schema...');

  // Create connection configuration without database selected first
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Allow executing multiple queries at once
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to MySQL server.');

    // Read database.sql file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`database.sql file not found at: ${sqlFilePath}`);
    }

    const sqlQueries = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute schema queries
    console.log('⏳ Creating database and tables...');
    await connection.query(sqlQueries);
    console.log('✅ Schema executed successfully.');

    await connection.end();
    console.log('🎉 Database setup complete! You are ready to start the server.');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
