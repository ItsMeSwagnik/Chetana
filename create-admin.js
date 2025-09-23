const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Add isadmin column if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS isadmin BOOLEAN DEFAULT FALSE
    `);
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user
    await pool.query(`
      INSERT INTO users (name, email, password, isadmin) 
      VALUES ('Admin', 'admin@chetana.com', $1, true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@chetana.com');
    console.log('Password: admin123');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();