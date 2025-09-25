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
    console.log('Attempting database connection...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10
    });
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
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
    
    // Create forum tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        anonymous_username VARCHAR(20) UNIQUE NOT NULL,
        aura_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        community VARCHAR(50) NOT NULL,
        author_username VARCHAR(20) NOT NULL,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_username VARCHAR(20) NOT NULL,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_votes (
        id SERIAL PRIMARY KEY,
        voter_username VARCHAR(20) NOT NULL,
        target_type VARCHAR(10) NOT NULL,
        target_id INTEGER NOT NULL,
        vote_type VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(voter_username, target_type, target_id)
      )
    `);
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, isadmin) 
      VALUES ('Admin', 'admin@chetana.com', $1, true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    res.json({ success: true, message: 'Database initialized with forum tables, default admin and assessment tracking' });
    await pool.end();
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Database initialization failed: ' + err.message,
      details: err.code || 'Unknown error'
    });
  }
}