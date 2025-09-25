const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
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
        target_type VARCHAR(10) NOT NULL, -- 'post' or 'comment'
        target_id INTEGER NOT NULL,
        vote_type VARCHAR(10) NOT NULL, -- 'upvote' or 'downvote'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(voter_username, target_type, target_id)
      )
    `);
    
    await pool.end();
    res.json({ success: true, message: 'Forum tables initialized' });
  } catch (err) {
    console.error('Forum init error:', err);
    res.status(500).json({ error: err.message });
  }
};