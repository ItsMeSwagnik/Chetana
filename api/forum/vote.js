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

    const { postId, commentId, voteType, voterUsername } = req.body;
    const targetType = postId ? 'post' : 'comment';
    const targetId = postId || commentId;
    
    if (!targetId || !voteType || !voterUsername) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT vote_type FROM forum_votes WHERE voter_username = $1 AND target_type = $2 AND target_id = $3',
      [voterUsername, targetType, targetId]
    );

    let auraChange = 0;
    let authorUsername = '';

    // Get post/comment author
    if (targetType === 'post') {
      const postResult = await pool.query('SELECT author_username FROM forum_posts WHERE id = $1', [targetId]);
      authorUsername = postResult.rows[0]?.author_username;
    } else {
      const commentResult = await pool.query('SELECT author_username FROM forum_comments WHERE id = $1', [targetId]);
      authorUsername = commentResult.rows[0]?.author_username;
    }

    // Don't allow self-voting
    if (authorUsername === voterUsername) {
      await pool.end();
      return res.status(400).json({ error: 'Cannot vote on your own content' });
    }

    if (existingVote.rows.length > 0) {
      const oldVote = existingVote.rows[0].vote_type;
      
      if (oldVote === voteType) {
        // Remove vote
        await pool.query(
          'DELETE FROM forum_votes WHERE voter_username = $1 AND target_type = $2 AND target_id = $3',
          [voterUsername, targetType, targetId]
        );
        
        // Update vote counts
        const updateField = voteType === 'upvote' ? 'upvotes = upvotes - 1' : 'downvotes = downvotes - 1';
        const table = targetType === 'post' ? 'forum_posts' : 'forum_comments';
        await pool.query(`UPDATE ${table} SET ${updateField} WHERE id = $1`, [targetId]);
        
        // Reverse aura change
        auraChange = voteType === 'upvote' ? -1 : 1;
      } else {
        // Change vote
        await pool.query(
          'UPDATE forum_votes SET vote_type = $1 WHERE voter_username = $2 AND target_type = $3 AND target_id = $4',
          [voteType, voterUsername, targetType, targetId]
        );
        
        // Update vote counts (remove old, add new)
        const table = targetType === 'post' ? 'forum_posts' : 'forum_comments';
        if (oldVote === 'upvote') {
          await pool.query(`UPDATE ${table} SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = $1`, [targetId]);
          auraChange = -2; // Lost upvote, gained downvote
        } else {
          await pool.query(`UPDATE ${table} SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = $1`, [targetId]);
          auraChange = 2; // Lost downvote, gained upvote
        }
      }
    } else {
      // New vote
      await pool.query(
        'INSERT INTO forum_votes (voter_username, target_type, target_id, vote_type) VALUES ($1, $2, $3, $4)',
        [voterUsername, targetType, targetId, voteType]
      );
      
      // Update vote counts
      const updateField = voteType === 'upvote' ? 'upvotes = upvotes + 1' : 'downvotes = downvotes + 1';
      const table = targetType === 'post' ? 'forum_posts' : 'forum_comments';
      await pool.query(`UPDATE ${table} SET ${updateField} WHERE id = $1`, [targetId]);
      
      auraChange = voteType === 'upvote' ? 1 : -1;
    }

    // Update author's aura points
    if (authorUsername && auraChange !== 0) {
      await pool.query(
        'UPDATE forum_users SET aura_points = GREATEST(0, aura_points + $1) WHERE anonymous_username = $2',
        [auraChange, authorUsername]
      );
    }

    await pool.end();
    res.json({ success: true, auraChange });

  } catch (err) {
    console.error('Forum vote error:', err);
    res.status(500).json({ error: err.message });
  }
};