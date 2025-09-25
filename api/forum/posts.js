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
      const { community, postId } = req.query;
      
      if (postId) {
        // Get specific post
        const result = await pool.query(
          'SELECT *, (upvotes - downvotes) as votes FROM forum_posts WHERE id = $1',
          [postId]
        );
        
        await pool.end();
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(result.rows[0]);
      } else {
        // Get posts for community
        const result = await pool.query(
          'SELECT *, (upvotes - downvotes) as votes FROM forum_posts WHERE community = $1 ORDER BY created_at DESC',
          [community || 'depression']
        );
        
        await pool.end();
        res.json(result.rows);
      }

    } else if (req.method === 'POST') {
      const { title, content, community, authorUsername } = req.body;
      
      if (!title || !content || !community || !authorUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        'INSERT INTO forum_posts (title, content, community, author_username) VALUES ($1, $2, $3, $4) RETURNING id',
        [title, content, community, authorUsername]
      );

      await pool.end();
      res.json({ success: true, postId: result.rows[0].id });
    }

  } catch (err) {
    console.error('Forum posts error:', err);
    res.status(500).json({ error: err.message });
  }
};