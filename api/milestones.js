const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Create milestones table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        milestone_id VARCHAR(50) NOT NULL,
        icon VARCHAR(10) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        achieved_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, milestone_id)
      )
    `);

    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const result = await pool.query(
        'SELECT * FROM milestones WHERE user_id = $1 ORDER BY achieved_date DESC',
        [userId]
      );

      return res.json({ success: true, milestones: result.rows });
    }

    if (req.method === 'POST') {
      const { userId, milestoneId, icon, title, description, achievedDate } = req.body;
      
      if (!userId || !milestoneId || !title) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await pool.query(
        'INSERT INTO milestones (user_id, milestone_id, icon, title, description, achieved_date) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id, milestone_id) DO NOTHING',
        [userId, milestoneId, icon, title, description, achievedDate || new Date().toISOString().split('T')[0]]
      );

      return res.json({ success: true });
    }

  } catch (err) {
    console.error('Milestones API error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};