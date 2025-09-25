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

    if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get or create anonymous username for user
      let result = await pool.query(
        'SELECT anonymous_username, aura_points FROM forum_users WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        // Generate unique anonymous username
        let username;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
          const randomCode = Math.random().toString(36).substring(2, 8);
          username = `u/${randomCode}`;
          
          const checkResult = await pool.query(
            'SELECT id FROM forum_users WHERE anonymous_username = $1',
            [username]
          );
          
          if (checkResult.rows.length === 0) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          return res.status(500).json({ error: 'Failed to generate unique username' });
        }

        // Create forum user
        await pool.query(
          'INSERT INTO forum_users (user_id, anonymous_username, aura_points) VALUES ($1, $2, $3)',
          [userId, username, 0]
        );

        result = await pool.query(
          'SELECT anonymous_username, aura_points FROM forum_users WHERE user_id = $1',
          [userId]
        );
      }

      await pool.end();
      res.json({
        success: true,
        username: result.rows[0].anonymous_username,
        auraPoints: result.rows[0].aura_points
      });

    } else if (req.method === 'POST') {
      const { userId, auraChange } = req.body;
      
      if (!userId || auraChange === undefined) {
        return res.status(400).json({ error: 'User ID and aura change required' });
      }

      // Update aura points
      await pool.query(
        'UPDATE forum_users SET aura_points = GREATEST(0, aura_points + $1) WHERE user_id = $2',
        [auraChange, userId]
      );

      const result = await pool.query(
        'SELECT aura_points FROM forum_users WHERE user_id = $1',
        [userId]
      );

      await pool.end();
      res.json({
        success: true,
        auraPoints: result.rows[0]?.aura_points || 0
      });
    }

  } catch (err) {
    console.error('Forum user error:', err);
    res.status(500).json({ error: err.message });
  }
};