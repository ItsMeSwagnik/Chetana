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
      const { postId } = req.query;
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID required' });
      }

      const result = await pool.query(
        'SELECT *, (upvotes - downvotes) as votes FROM forum_comments WHERE post_id = $1 ORDER BY created_at ASC',
        [postId]
      );
      
      await pool.end();
      res.json(result.rows);

    } else if (req.method === 'POST') {
      const { postId, content, authorUsername } = req.body;
      
      if (!postId || !content || !authorUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        'INSERT INTO forum_comments (post_id, content, author_username) VALUES ($1, $2, $3) RETURNING id',
        [postId, content, authorUsername]
      );

      await pool.end();
      res.json({ success: true, commentId: result.rows[0].id });
    }

  } catch (err) {
    console.error('Forum comments error:', err);
    res.status(500).json({ error: err.message });
  }
};