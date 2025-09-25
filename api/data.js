const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    switch (action) {
      case 'assessments':
        if (req.method === 'POST') {
          const { userId, phq9, gad7, pss, responses } = req.body;
          
          let result;
          try {
            result = await pool.query(
              'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score, responses) VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [userId, phq9, gad7, pss, JSON.stringify(responses || {})]
            );
          } catch (err) {
            result = await pool.query(
              'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score) VALUES ($1, $2, $3, $4) RETURNING *',
              [userId, phq9, gad7, pss]
            );
          }
          
          return res.json({ success: true, assessment: result.rows[0] });
        } else if (req.method === 'GET') {
          const { userId } = req.query;
          
          if (!userId) {
            return res.status(400).json({ error: 'userId parameter required' });
          }
          
          let result;
          try {
            result = await pool.query(
              'SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC',
              [userId]
            );
          } catch (err) {
            result = await pool.query(
              'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
              [userId]
            );
          }
          
          return res.json({ assessments: result.rows || [] });
        }
        break;

      case 'moods':
        await pool.query(`
          CREATE TABLE IF NOT EXISTS mood_entries (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            mood_date DATE NOT NULL,
            mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, mood_date)
          )
        `);

        if (req.method === 'POST') {
          const { userId, moodDate, moodRating } = req.body;
          
          if (!userId || !moodDate || !moodRating) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
          }

          const result = await pool.query(`
            INSERT INTO mood_entries (user_id, mood_date, mood_rating)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, mood_date)
            DO UPDATE SET mood_rating = $3, created_at = CURRENT_TIMESTAMP
            RETURNING *
          `, [userId, moodDate, moodRating]);

          return res.json({ success: true, mood: result.rows[0] });
        } else if (req.method === 'GET') {
          const { userId } = req.query;
          
          if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID required' });
          }

          const result = await pool.query(`
            SELECT * FROM mood_entries 
            WHERE user_id = $1 
            AND mood_date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY mood_date DESC
          `, [userId]);

          return res.json({ success: true, moods: result.rows });
        }
        break;

      case 'milestones':
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
        } else if (req.method === 'POST') {
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
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    console.error('Data API error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};