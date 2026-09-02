/**
 * reset-users.js
 * 
 * Fixes/creates two accounts in lunsole_booking:
 *   admin@lunsole.com  / Admin123!  / role: admin
 *   user@lunsole.com   / User123!   / role: user
 *
 * Uses the SAME bcryptjs method as authController.js (salt rounds = 10).
 * Run ONCE: node reset-users.js
 * Safe to run multiple times — uses INSERT ... ON DUPLICATE KEY UPDATE.
 */

const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');
require('dotenv').config();

const ACCOUNTS = [
  {
    first_name: 'Admin',
    last_name:  'LUNSOLE',
    email:      'admin@lunsole.com',
    password:   'Admin123!',
    role:       'admin',
  },
  {
    first_name: 'Test',
    last_name:  'User',
    email:      'user@lunsole.com',
    password:   'User123!',
    role:       'user',
  },
];

async function run() {
  const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lunsole_booking',
  });

  console.log('\n🔧 LUNSOLE — Password Reset Script');
  console.log('===================================\n');

  for (const account of ACCOUNTS) {
    console.log(`⚙️  Processing: ${account.email}  (role: ${account.role})`);

    // Hash password exactly like authController (salt rounds = 10)
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(account.password, salt);

    // Check if user exists
    const [rows] = await pool.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [account.email]
    );

    if (rows.length > 0) {
      const existing = rows[0];
      console.log(`   ✅ User found (id=${existing.id}). Resetting password + ensuring role=${account.role}`);

      await pool.query(
        'UPDATE users SET password = ?, role = ?, first_name = ?, last_name = ? WHERE email = ?',
        [hashed, account.role, account.first_name, account.last_name, account.email]
      );
      console.log(`   ✅ Updated successfully.\n`);
    } else {
      console.log(`   ℹ️  User not found. Creating new account...`);

      const [result] = await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [account.first_name, account.last_name, account.email, hashed, account.role]
      );
      console.log(`   ✅ Created (id=${result.insertId}).\n`);
    }

    // Verify the hash works immediately
    const [verify] = await pool.query(
      'SELECT password FROM users WHERE email = ?',
      [account.email]
    );
    const ok = await bcrypt.compare(account.password, verify[0].password);
    console.log(`   🔐 Hash verification: ${ok ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  // Show final state of users table
  const [allUsers] = await pool.query(
    'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id'
  );

  console.log('📋 Current users table:');
  console.log('─'.repeat(75));
  console.log('ID  | Name                    | Email                     | Role ');
  console.log('─'.repeat(75));
  allUsers.forEach(u => {
    const name  = `${u.first_name} ${u.last_name}`.padEnd(23);
    const email = u.email.padEnd(25);
    console.log(`${String(u.id).padEnd(3)} | ${name} | ${email} | ${u.role}`);
  });
  console.log('─'.repeat(75));

  console.log('\n✅ Done! You can now log in with:');
  console.log('   Admin:  admin@lunsole.com / Admin123!');
  console.log('   User:   user@lunsole.com  / User123!\n');

  await pool.end();
}

run().catch(err => {
  console.error('\n❌ Script failed:', err.message);
  process.exit(1);
});
