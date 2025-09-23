const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        dob DATE,
        isadmin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        phq9_score INTEGER,
        gad7_score INTEGER,
        pss_score INTEGER,
        responses JSONB,
        assessment_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add responses column if it doesn't exist (for existing databases)
    await pool.query(`
      ALTER TABLE assessments 
      ADD COLUMN IF NOT EXISTS responses JSONB
    `).catch(() => {});
    
    // Create default admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, isadmin) 
      VALUES ('Admin', 'admin@chetana.com', $1, true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    res.json({ success: true, message: 'Database initialized with default admin and assessment tracking' });
  } catch (err) {
    res.status(500).json({ error: 'Database initialization failed: ' + err.message });
  }
}