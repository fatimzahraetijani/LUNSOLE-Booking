const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lunsole_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection pool
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to database:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();

module.exports = pool;
