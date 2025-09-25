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
      case 'init':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        await pool.query(`CREATE TABLE IF NOT EXISTS forum_users (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, anonymous_username VARCHAR(20) UNIQUE NOT NULL, aura_points INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS forum_posts (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, community VARCHAR(50) NOT NULL, author_username VARCHAR(20) NOT NULL, upvotes INTEGER DEFAULT 0, downvotes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS forum_comments (id SERIAL PRIMARY KEY, post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE, content TEXT NOT NULL, author_username VARCHAR(20) NOT NULL, upvotes INTEGER DEFAULT 0, downvotes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS forum_votes (id SERIAL PRIMARY KEY, voter_username VARCHAR(20) NOT NULL, target_type VARCHAR(10) NOT NULL, target_id INTEGER NOT NULL, vote_type VARCHAR(10) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(voter_username, target_type, target_id))`);
        
        await pool.end();
        return res.json({ success: true, message: 'Forum tables initialized' });

      case 'posts':
        if (req.method === 'GET') {
          const { community, postId } = req.query;
          
          if (postId) {
            const result = await pool.query('SELECT *, (upvotes - downvotes) as votes FROM forum_posts WHERE id = $1', [postId]);
            await pool.end();
            if (result.rows.length === 0) {
              return res.status(404).json({ error: 'Post not found' });
            }
            return res.json(result.rows[0]);
          } else {
            const result = await pool.query('SELECT *, (upvotes - downvotes) as votes FROM forum_posts WHERE community = $1 ORDER BY created_at DESC', [community || 'depression']);
            await pool.end();
            return res.json(result.rows);
          }
        } else if (req.method === 'POST') {
          const { title, content, community, authorUsername } = req.body;
          
          if (!title || !content || !community || !authorUsername) {
            return res.status(400).json({ error: 'Missing required fields' });
          }

          const result = await pool.query('INSERT INTO forum_posts (title, content, community, author_username) VALUES ($1, $2, $3, $4) RETURNING id', [title, content, community, authorUsername]);
          await pool.end();
          return res.json({ success: true, postId: result.rows[0].id });
        }
        break;

      case 'comments':
        if (req.method === 'GET') {
          const { postId } = req.query;
          
          if (!postId) {
            return res.status(400).json({ error: 'Post ID required' });
          }

          const result = await pool.query('SELECT *, (upvotes - downvotes) as votes FROM forum_comments WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
          await pool.end();
          return res.json(result.rows);
        } else if (req.method === 'POST') {
          const { postId, content, authorUsername } = req.body;
          
          if (!postId || !content || !authorUsername) {
            return res.status(400).json({ error: 'Missing required fields' });
          }

          const result = await pool.query('INSERT INTO forum_comments (post_id, content, author_username) VALUES ($1, $2, $3) RETURNING id', [postId, content, authorUsername]);
          await pool.end();
          return res.json({ success: true, commentId: result.rows[0].id });
        }
        break;

      case 'vote':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { postId, commentId, voteType, voterUsername } = req.body;
        const targetType = postId ? 'post' : 'comment';
        const targetId = postId || commentId;
        
        if (!targetId || !voteType || !voterUsername) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingVote = await pool.query('SELECT vote_type FROM forum_votes WHERE voter_username = $1 AND target_type = $2 AND target_id = $3', [voterUsername, targetType, targetId]);

        let auraChange = 0;
        let authorUsername = '';

        if (targetType === 'post') {
          const postResult = await pool.query('SELECT author_username FROM forum_posts WHERE id = $1', [targetId]);
          authorUsername = postResult.rows[0]?.author_username;
        } else {
          const commentResult = await pool.query('SELECT author_username FROM forum_comments WHERE id = $1', [targetId]);
          authorUsername = commentResult.rows[0]?.author_username;
        }

        if (authorUsername === voterUsername) {
          await pool.end();
          return res.status(400).json({ error: 'Cannot vote on your own content' });
        }

        if (existingVote.rows.length > 0) {
          const oldVote = existingVote.rows[0].vote_type;
          
          if (oldVote === voteType) {
            await pool.query('DELETE FROM forum_votes WHERE voter_username = $1 AND target_type = $2 AND target_id = $3', [voterUsername, targetType, targetId]);
            
            const updateField = voteType === 'upvote' ? 'upvotes = upvotes - 1' : 'downvotes = downvotes - 1';
            const table = targetType === 'post' ? 'forum_posts' : 'forum_comments';
            await pool.query(`UPDATE ${table} SET ${updateField} WHERE id = $1`, [targetId]);
            
            auraChange = voteType === 'upvote' ? -1 : 1;
          } else {
            await pool.query('UPDATE forum_votes SET vote_type = $1 WHERE voter_username = $2 AND target_type = $3 AND target_id = $4', [voteType, voterUsername, targetType, targetId]);
            
            const table = targetType === 'post' ? 'forum_posts' : 'forum_comments';
            if (oldVote === 'upvote') {
              await pool.query(`UPDATE ${table} SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = $1`, [targetId]);
              auraChange = -2;
            } else {
              await pool.query(`UPDATE ${table} SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = $1`, [targetId]);
              auraChange = 2;
            }
          }
        } else {
          await pool.query('INSERT INTO forum_votes (voter_username, target_type, target_id, vote_type) VALUES ($1, $2, $3, $4)', [voterUsername, targetType, targetId, voteType]);
          
          const updateField = voteType === 'upvote' ? 'upvotes = upvotes + 1' : 'downvotes = downvotes + 1';
          const table = targetType === 'post' ? 'forum_posts' : 'forum_comments';
          await pool.query(`UPDATE ${table} SET ${updateField} WHERE id = $1`, [targetId]);
          
          auraChange = voteType === 'upvote' ? 1 : -1;
        }

        if (authorUsername && auraChange !== 0) {
          await pool.query('UPDATE forum_users SET aura_points = GREATEST(0, aura_points + $1) WHERE anonymous_username = $2', [auraChange, authorUsername]);
        }

        await pool.end();
        return res.json({ success: true, auraChange });

      case 'user':
        if (req.method === 'GET') {
          const { userId } = req.query;
          
          if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
          }

          let result = await pool.query('SELECT anonymous_username, aura_points FROM forum_users WHERE user_id = $1', [userId]);

          if (result.rows.length === 0) {
            let username;
            let isUnique = false;
            let attempts = 0;
            
            while (!isUnique && attempts < 10) {
              const randomCode = Math.random().toString(36).substring(2, 8);
              username = `u/${randomCode}`;
              
              const checkResult = await pool.query('SELECT id FROM forum_users WHERE anonymous_username = $1', [username]);
              
              if (checkResult.rows.length === 0) {
                isUnique = true;
              }
              attempts++;
            }

            if (!isUnique) {
              return res.status(500).json({ error: 'Failed to generate unique username' });
            }

            await pool.query('INSERT INTO forum_users (user_id, anonymous_username, aura_points) VALUES ($1, $2, $3)', [userId, username, 0]);
            result = await pool.query('SELECT anonymous_username, aura_points FROM forum_users WHERE user_id = $1', [userId]);
          }

          await pool.end();
          return res.json({ success: true, username: result.rows[0].anonymous_username, auraPoints: result.rows[0].aura_points });
        } else if (req.method === 'POST') {
          const { userId, auraChange } = req.body;
          
          if (!userId || auraChange === undefined) {
            return res.status(400).json({ error: 'User ID and aura change required' });
          }

          await pool.query('UPDATE forum_users SET aura_points = GREATEST(0, aura_points + $1) WHERE user_id = $2', [auraChange, userId]);
          const result = await pool.query('SELECT aura_points FROM forum_users WHERE user_id = $1', [userId]);

          await pool.end();
          return res.json({ success: true, auraPoints: result.rows[0]?.aura_points || 0 });
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    console.error('Forum API error:', err);
    res.status(500).json({ error: err.message });
  }
};
