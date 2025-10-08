const { Pool } = require('pg');
const validator = require('validator');

// Valid communities constant
const VALID_COMMUNITIES = ['depression', 'anxiety', 'stress', 'general'];

// Input sanitization - don't escape for usernames, only for content
function sanitizeInput(input, escapeHtml = true) {
  if (typeof input !== 'string') return input;
  const trimmed = input.trim();
  return escapeHtml ? validator.escape(trimmed) : trimmed;
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  window: 60000, // 1 minute
  maxActions: 50 // Increased from 10 to 50
};
const actionCounts = new Map();

function checkRateLimit(identifier) {
  const now = Date.now();
  const userActions = actionCounts.get(identifier) || [];
  
  // Remove old actions outside the window
  const recentActions = userActions.filter(time => now - time < RATE_LIMIT_CONFIG.window);
  
  if (recentActions.length >= RATE_LIMIT_CONFIG.maxActions) {
    return false;
  }
  
  recentActions.push(now);
  actionCounts.set(identifier, recentActions);
  return true;
}

// Database pool configuration
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

module.exports = async function handler(req, res) {
  // Security headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || 'https://chetana.vercel.app' : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  
  let pool;
  try {
    pool = new Pool(DB_CONFIG);

    switch (action) {
      case 'init':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        try {
          // Check if tables exist first to avoid sequence conflicts
          const tableCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'forum_%'
          `);
          
          const existingTables = tableCheck.rows.map(row => row.table_name);
          
          // Only create tables that don't exist
          if (!existingTables.includes('forum_posts')) {
            await pool.query(`CREATE TABLE forum_posts (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, community VARCHAR(50) NOT NULL, author_uid VARCHAR(20) NOT NULL, upvotes INTEGER DEFAULT 0, downvotes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, pinned BOOLEAN DEFAULT FALSE)`);
          }
          
          if (!existingTables.includes('forum_comments')) {
            await pool.query(`CREATE TABLE forum_comments (id SERIAL PRIMARY KEY, post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE, content TEXT NOT NULL, author_uid VARCHAR(20) NOT NULL, upvotes INTEGER DEFAULT 0, downvotes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, pinned BOOLEAN DEFAULT FALSE)`);
          }
          
          if (!existingTables.includes('forum_votes')) {
            await pool.query(`CREATE TABLE forum_votes (id SERIAL PRIMARY KEY, voter_uid VARCHAR(20) NOT NULL, target_type VARCHAR(10) NOT NULL, target_id INTEGER NOT NULL, vote_type VARCHAR(10) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(voter_uid, target_type, target_id))`);
          }
          
          if (!existingTables.includes('forum_aura')) {
            await pool.query(`CREATE TABLE forum_aura (id SERIAL PRIMARY KEY, user_uid VARCHAR(20) UNIQUE NOT NULL, aura_points INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
          }
          
          if (!existingTables.includes('forum_memberships')) {
            await pool.query(`CREATE TABLE forum_memberships (id SERIAL PRIMARY KEY, user_uid VARCHAR(20) NOT NULL, community VARCHAR(50) NOT NULL, joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_uid, community))`);
          }
          
          if (!existingTables.includes('forum_reports')) {
            await pool.query(`CREATE TABLE forum_reports (id SERIAL PRIMARY KEY, type VARCHAR(10) NOT NULL, content_id INTEGER NOT NULL, reason TEXT NOT NULL, reporter_uid VARCHAR(20) NOT NULL, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, resolved_at TIMESTAMP)`);
          }
          
          if (!existingTables.includes('forum_community_rules')) {
            await pool.query(`CREATE TABLE forum_community_rules (id SERIAL PRIMARY KEY, community VARCHAR(50) NOT NULL, rules TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(community))`);
          }
          
          // Add missing pinned columns if they don't exist
          try {
            await pool.query('ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE');
          } catch (err) {
            // Column already exists or error, ignore
          }
          
          try {
            await pool.query('ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE');
          } catch (err) {
            // Column already exists or error, ignore
          }
          
          // Insert default rules for each community
          const defaultRules = {
            depression: `1. Be respectful and supportive to all members
2. No medical advice - encourage professional help when needed
3. Use trigger warnings for sensitive content
4. No spam, self-promotion, or off-topic posts
5. Respect privacy - don't share personal information
6. Report harmful or inappropriate content
7. Be patient with others who are struggling`,
            anxiety: `1. Create a safe and supportive environment
2. No judgment or dismissive comments about anxiety
3. Share coping strategies and resources respectfully
4. Use content warnings for panic attack descriptions
5. No medical advice - suggest professional consultation
6. Respect different anxiety experiences and triggers
7. Keep discussions focused on anxiety-related topics`,
            stress: `1. Maintain a supportive and understanding community
2. Share stress management techniques constructively
3. No work-specific complaints without solutions
4. Respect different stress levels and coping methods
5. Encourage healthy stress management practices
6. No promotion of unhealthy coping mechanisms
7. Keep content relevant to stress management and wellness`
          };
          
          // Define welcome posts for each community
          const welcomePosts = {
            depression: {
              title: 'Welcome to the Depression Support Community',
              content: 'Welcome to our safe space for depression support. Here you can share your experiences, find encouragement, and connect with others who understand. Please read our community guidelines and remember that professional help is always recommended for serious concerns.'
            },
            anxiety: {
              title: 'Welcome to the Anxiety Support Community', 
              content: 'Welcome to our anxiety support community. This is a judgment-free zone where you can share your struggles, coping strategies, and victories. Please be mindful of triggers and always encourage professional help when needed.'
            },
            stress: {
              title: 'Welcome to the Stress Management Community',
              content: 'Welcome to our stress management community. Share your stress management techniques, workplace challenges, and wellness tips. Let us support each other in building healthier, more balanced lives.'
            }
          };
          
          for (const [community, rules] of Object.entries(defaultRules)) {
            await pool.query('INSERT INTO forum_community_rules (community, rules) VALUES ($1, $2) ON CONFLICT (community) DO NOTHING', [community, rules]);
          }
          
          // Clean up any duplicate welcome posts first
          await pool.query(`
            DELETE FROM forum_posts 
            WHERE id NOT IN (
              SELECT MIN(id) 
              FROM forum_posts 
              WHERE (title ILIKE '%welcome%' OR title ILIKE '%community guidelines%') AND author_uid = 'admin'
              GROUP BY community
            )
            AND (title ILIKE '%welcome%' OR title ILIKE '%community guidelines%') AND author_uid = 'admin'
          `);
          
          // Insert welcome posts only if they don't exist
          for (const [community, welcomePost] of Object.entries(welcomePosts)) {
            const existing = await pool.query('SELECT id FROM forum_posts WHERE community = $1 AND (title ILIKE $2 OR title ILIKE $3)', [community, '%welcome%', '%community guidelines%']);
            if (existing.rows.length === 0) {
              await pool.query('INSERT INTO forum_posts (title, content, community, author_uid, pinned, upvotes) VALUES ($1, $2, $3, $4, true, 1)', [welcomePost.title, welcomePost.content, community, 'admin']);
            }
          }
          
          await pool.end();
          return res.json({ success: true, message: 'Forum tables initialized' });
        } catch (dbError) {
          console.error('Forum init DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Failed to initialize forum tables' });
        }

      case 'cleanup-admin-posts':
        try {
          // Delete all duplicate admin welcome posts, keeping only one per community
          const deleteResult = await pool.query(`
            DELETE FROM forum_posts 
            WHERE id NOT IN (
              SELECT MIN(id) 
              FROM forum_posts 
              WHERE author_uid = 'admin' AND (title ILIKE '%welcome%' OR title ILIKE '%community%')
              GROUP BY community
            )
            AND author_uid = 'admin' AND (title ILIKE '%welcome%' OR title ILIKE '%community%')
          `);
          
          await pool.end();
          return res.json({ 
            success: true, 
            message: `Cleaned up ${deleteResult.rowCount} duplicate admin posts` 
          });
        } catch (dbError) {
          console.error('Cleanup admin posts error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Failed to cleanup admin posts' });
        }

      case 'posts':
        if (req.method === 'GET') {
          const { community, postId, userUid } = req.query;
          
          try {
            if (postId) {
              const sanitizedPostId = parseInt(postId);
              if (isNaN(sanitizedPostId) || sanitizedPostId <= 0) {
                await pool.end();
                return res.status(400).json({ error: 'Invalid post ID' });
              }
              
              let query = `
                SELECT p.*, (p.upvotes - p.downvotes) as votes,
                       (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count
                FROM forum_posts p WHERE p.id = $1
              `;
              let params = [sanitizedPostId];
              
              if (userUid) {
                const sanitizedUserUid = sanitizeInput(userUid, false);
                query = `
                  SELECT p.*, (p.upvotes - p.downvotes) as votes,
                         (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count,
                         v.vote_type as user_vote
                  FROM forum_posts p
                  LEFT JOIN forum_votes v ON v.target_type = 'post' AND v.target_id = p.id AND v.voter_uid = $2
                  WHERE p.id = $1
                `;
                params = [sanitizedPostId, sanitizedUserUid];
              }
              
              const result = await pool.query(query, params);
              await pool.end();
              if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
              }
              return res.json(result.rows[0]);
            } else {
              let query = `
                SELECT p.*, (p.upvotes - p.downvotes) as votes, 
                       COALESCE(p.pinned, false) as pinned,
                       (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count
                FROM forum_posts p 
                WHERE p.community = $1 
                ORDER BY COALESCE(p.pinned, false) DESC, p.created_at DESC LIMIT 20
              `;
              let params = [community || 'depression'];
              
              if (userUid) {
                const sanitizedUserUid = sanitizeInput(userUid, false);
                query = `
                  SELECT p.*, (p.upvotes - p.downvotes) as votes,
                         COALESCE(p.pinned, false) as pinned,
                         (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count,
                         v.vote_type as user_vote
                  FROM forum_posts p
                  LEFT JOIN forum_votes v ON v.target_type = 'post' AND v.target_id = p.id AND v.voter_uid = $2
                  WHERE p.community = $1
                  ORDER BY COALESCE(p.pinned, false) DESC, p.created_at DESC LIMIT 20
                `;
                params = [community || 'depression', sanitizedUserUid];
              }
              
              const result = await pool.query(query, params);
              await pool.end();
              return res.json(result.rows);
            }
          } catch (dbError) {
            console.error('Forum posts DB error:', dbError);
            await pool.end();
            return res.json([]);
          }
        } else if (req.method === 'POST') {
          const { title, content, community, authorUid } = req.body;
          
          if (!title || !content || !community || !authorUid) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          
          // Input validation and sanitization
          const sanitizedTitle = sanitizeInput(title);
          const sanitizedContent = sanitizeInput(content);
          const sanitizedCommunity = sanitizeInput(community);
          const sanitizedAuthorUid = sanitizeInput(authorUid, false);
          
          if (sanitizedTitle.length < 5 || sanitizedTitle.length > 200) {
            return res.status(400).json({ error: 'Title must be between 5 and 200 characters' });
          }
          
          if (sanitizedContent.length < 10 || sanitizedContent.length > 5000) {
            return res.status(400).json({ error: 'Content must be between 10 and 5000 characters' });
          }
          
          if (!VALID_COMMUNITIES.includes(sanitizedCommunity)) {
            return res.status(400).json({ error: 'Invalid community' });
          }

          try {
            // Check if this is a welcome post or admin post for auto-pinning
            const isWelcomePost = sanitizedTitle.toLowerCase().includes('welcome') || sanitizedTitle.toLowerCase().includes('community guidelines');
            const isAdmin = sanitizedAuthorUid === 'u/kklt3o' || sanitizedAuthorUid === 'admin@chetana.com' || sanitizedAuthorUid === 'admin';
            const shouldPin = (isWelcomePost && isAdmin) || isAdmin;
            
            const result = await pool.query('INSERT INTO forum_posts (title, content, community, author_uid, pinned, upvotes) VALUES ($1, $2, $3, $4, $5, 1) RETURNING id', [sanitizedTitle, sanitizedContent, sanitizedCommunity, sanitizedAuthorUid, shouldPin]);
            
            // Auto-upvote own post
            await pool.query('INSERT INTO forum_votes (voter_uid, target_type, target_id, vote_type) VALUES ($1, $2, $3, $4)', [sanitizedAuthorUid, 'post', result.rows[0].id, 'upvote']);
            
            // Add aura points for creating post and auto-upvote
            await pool.query('INSERT INTO forum_aura (user_uid, aura_points) VALUES ($1, 2) ON CONFLICT (user_uid) DO UPDATE SET aura_points = forum_aura.aura_points + 2', [sanitizedAuthorUid]);
            
            await pool.end();
            return res.json({ success: true, postId: result.rows[0].id });
          } catch (dbError) {
            console.error('Forum post creation DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        } else if (req.method === 'DELETE') {
          const { id, authorUid } = req.body;
          
          if (!id || !authorUid) {
            return res.status(400).json({ error: 'Missing required fields' });
          }

          const sanitizedId = parseInt(id);
          if (isNaN(sanitizedId) || sanitizedId <= 0) {
            return res.status(400).json({ error: 'Invalid post ID' });
          }

          const sanitizedAuthorUid = sanitizeInput(authorUid, false);

          try {
            const result = await pool.query('DELETE FROM forum_posts WHERE id = $1 AND author_uid = $2', [sanitizedId, sanitizedAuthorUid]);
            await pool.end();
            if (result.rowCount > 0) {
              return res.json({ success: true });
            } else {
              return res.status(403).json({ error: 'Not authorized to delete this post' });
            }
          } catch (dbError) {
            console.error('Forum post deletion DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        }
        break;

      case 'comments':
        if (req.method === 'GET') {
          const { postId, userUid } = req.query;
          
          if (!postId) {
            return res.status(400).json({ error: 'Post ID required' });
          }

          const sanitizedPostId = parseInt(postId);
          if (isNaN(sanitizedPostId) || sanitizedPostId <= 0) {
            return res.status(400).json({ error: 'Invalid post ID' });
          }

          try {
            let query = 'SELECT *, (upvotes - downvotes) as votes, COALESCE(pinned, false) as pinned FROM forum_comments WHERE post_id = $1 ORDER BY COALESCE(pinned, false) DESC, created_at ASC';
            let params = [sanitizedPostId];
            
            if (userUid) {
              const sanitizedUserUid = sanitizeInput(userUid, false);
              query = `
                SELECT c.*, (c.upvotes - c.downvotes) as votes,
                       COALESCE(c.pinned, false) as pinned,
                       v.vote_type as user_vote
                FROM forum_comments c
                LEFT JOIN forum_votes v ON v.target_type = 'comment' AND v.target_id = c.id AND v.voter_uid = $2
                WHERE c.post_id = $1
                ORDER BY COALESCE(c.pinned, false) DESC, c.created_at ASC
              `;
              params = [sanitizedPostId, sanitizedUserUid];
            }
            
            const result = await pool.query(query, params);
            await pool.end();
            return res.json(result.rows);
          } catch (dbError) {
            console.error('Forum comments DB error:', dbError);
            await pool.end();
            return res.json([]);
          }
        } else if (req.method === 'POST') {
          const { postId, content, authorUid } = req.body;
          
          if (!postId || !content || !authorUid) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          
          // Input validation and sanitization
          const sanitizedContent = sanitizeInput(content);
          const sanitizedAuthorUid = sanitizeInput(authorUid, false);
          
          if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({ error: 'Invalid post ID' });
          }
          
          if (sanitizedContent.length < 1 || sanitizedContent.length > 2000) {
            return res.status(400).json({ error: 'Comment must be between 1 and 2000 characters' });
          }

          try {
            // Check if this is an admin comment for auto-pinning
            const isAdmin = sanitizedAuthorUid === 'u/kklt3o' || sanitizedAuthorUid === 'admin@chetana.com' || sanitizedAuthorUid === 'admin';
            
            const result = await pool.query('INSERT INTO forum_comments (post_id, content, author_uid, pinned, upvotes) VALUES ($1, $2, $3, $4, 1) RETURNING id', [postId, sanitizedContent, sanitizedAuthorUid, isAdmin]);
            
            // Auto-upvote own comment
            await pool.query('INSERT INTO forum_votes (voter_uid, target_type, target_id, vote_type) VALUES ($1, $2, $3, $4)', [sanitizedAuthorUid, 'comment', result.rows[0].id, 'upvote']);
            
            // Add aura points for creating comment and auto-upvote
            await pool.query('INSERT INTO forum_aura (user_uid, aura_points) VALUES ($1, 2) ON CONFLICT (user_uid) DO UPDATE SET aura_points = forum_aura.aura_points + 2', [sanitizedAuthorUid]);
            
            await pool.end();
            return res.json({ success: true, commentId: result.rows[0].id });
          } catch (dbError) {
            console.error('Forum comment creation DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        } else if (req.method === 'DELETE') {
          const { id, authorUid } = req.body;
          
          if (!id || !authorUid) {
            return res.status(400).json({ error: 'Missing required fields' });
          }

          const sanitizedAuthorUid = sanitizeInput(authorUid, false);

          try {
            const result = await pool.query('DELETE FROM forum_comments WHERE id = $1 AND author_uid = $2', [id, sanitizedAuthorUid]);
            await pool.end();
            if (result.rowCount > 0) {
              return res.json({ success: true });
            } else {
              return res.status(403).json({ error: 'Not authorized to delete this comment' });
            }
          } catch (dbError) {
            console.error('Forum comment deletion DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        }
        break;

      case 'vote':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { postId, commentId: targetCommentId, voteType, voterUid } = req.body;
        const targetType = postId ? 'post' : 'comment';
        const targetId = postId || targetCommentId;
        
        if (!targetId || !voteType || !voterUid) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Input validation
        const parsedTargetId = parseInt(targetId);
        if (isNaN(parsedTargetId) || parsedTargetId <= 0) {
          return res.status(400).json({ error: 'Invalid target ID' });
        }
        const finalTargetId = parsedTargetId;
        
        if (!['upvote', 'downvote'].includes(voteType)) {
          return res.status(400).json({ error: 'Invalid vote type' });
        }
        
        if (!['post', 'comment'].includes(targetType)) {
          return res.status(400).json({ error: 'Invalid target type' });
        }
        
        const sanitizedVoterUid = sanitizeInput(voterUid, false);

        try {
          // Ensure targetType is safe for SQL query
          const safeTargetType = targetType === 'post' ? 'post' : 'comment';
          const existingVote = await pool.query('SELECT vote_type FROM forum_votes WHERE voter_uid = $1 AND target_type = $2 AND target_id = $3', [sanitizedVoterUid, safeTargetType, finalTargetId]);

          let auraChange = 0;
          let authorUid = '';

          if (targetType === 'post') {
            const postResult = await pool.query('SELECT author_uid FROM forum_posts WHERE id = $1', [finalTargetId]);
            authorUid = postResult.rows[0]?.author_uid;
          } else {
            const commentResult = await pool.query('SELECT author_uid FROM forum_comments WHERE id = $1', [finalTargetId]);
            authorUid = commentResult.rows[0]?.author_uid;
          }

          if (authorUid === sanitizedVoterUid) {
            await pool.end();
            return res.status(400).json({ error: 'Cannot vote on your own content' });
          }

          if (existingVote.rows.length > 0) {
            const oldVote = existingVote.rows[0].vote_type;
            
            if (oldVote === voteType) {
              // Remove vote (toggle off)
              await pool.query('DELETE FROM forum_votes WHERE voter_uid = $1 AND target_type = $2 AND target_id = $3', [sanitizedVoterUid, safeTargetType, finalTargetId]);
              
              if (targetType === 'post') {
                if (voteType === 'upvote') {
                  await pool.query('UPDATE forum_posts SET upvotes = upvotes - 1 WHERE id = $1', [finalTargetId]);
                } else {
                  await pool.query('UPDATE forum_posts SET downvotes = downvotes - 1 WHERE id = $1', [finalTargetId]);
                }
              } else {
                if (voteType === 'upvote') {
                  await pool.query('UPDATE forum_comments SET upvotes = upvotes - 1 WHERE id = $1', [finalTargetId]);
                } else {
                  await pool.query('UPDATE forum_comments SET downvotes = downvotes - 1 WHERE id = $1', [finalTargetId]);
                }
              }
              
              auraChange = voteType === 'upvote' ? -1 : 1;
            } else {
              // Change vote type
              await pool.query('UPDATE forum_votes SET vote_type = $1 WHERE voter_uid = $2 AND target_type = $3 AND target_id = $4', [voteType, sanitizedVoterUid, safeTargetType, finalTargetId]);
              
              if (targetType === 'post') {
                if (oldVote === 'upvote') {
                  await pool.query('UPDATE forum_posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = $1', [finalTargetId]);
                  auraChange = -2;
                } else {
                  await pool.query('UPDATE forum_posts SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = $1', [finalTargetId]);
                  auraChange = 2;
                }
              } else {
                if (oldVote === 'upvote') {
                  await pool.query('UPDATE forum_comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = $1', [finalTargetId]);
                  auraChange = -2;
                } else {
                  await pool.query('UPDATE forum_comments SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = $1', [finalTargetId]);
                  auraChange = 2;
                }
              }
            }
          } else {
            // New vote - use UPSERT to prevent duplicates
            await pool.query('INSERT INTO forum_votes (voter_uid, target_type, target_id, vote_type) VALUES ($1, $2, $3, $4) ON CONFLICT (voter_uid, target_type, target_id) DO UPDATE SET vote_type = $4', [sanitizedVoterUid, safeTargetType, finalTargetId, voteType]);
            
            if (targetType === 'post') {
              if (voteType === 'upvote') {
                await pool.query('UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = $1', [finalTargetId]);
              } else {
                await pool.query('UPDATE forum_posts SET downvotes = downvotes + 1 WHERE id = $1', [finalTargetId]);
              }
            } else {
              if (voteType === 'upvote') {
                await pool.query('UPDATE forum_comments SET upvotes = upvotes + 1 WHERE id = $1', [finalTargetId]);
              } else {
                await pool.query('UPDATE forum_comments SET downvotes = downvotes + 1 WHERE id = $1', [finalTargetId]);
              }
            }
            
            auraChange = voteType === 'upvote' ? 1 : -1;
          }

          if (authorUid && auraChange !== 0) {
            await pool.query('UPDATE forum_aura SET aura_points = GREATEST(0, aura_points + $1) WHERE user_uid = $2', [auraChange, authorUid]);
          }

          await pool.end();
          return res.json({ success: true, auraChange });
        } catch (dbError) {
          console.error('Forum vote DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'user':
        if (req.method === 'GET') {
          const { userId } = req.query;
          
          if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
          }

          const sanitizedUserId = parseInt(userId);
          if (isNaN(sanitizedUserId) || sanitizedUserId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
          }

          try {
            // Get user's forum UID and admin status from users table
            let userResult = await pool.query('SELECT forum_uid, isadmin, email FROM users WHERE id = $1', [sanitizedUserId]);
            
            if (userResult.rows.length === 0) {
              await pool.end();
              return res.status(404).json({ error: 'User not found' });
            }
            
            let user = userResult.rows[0];
            let forumUid = user.forum_uid;
            
            // Handle admin users specially
            if (user.isadmin || user.email === 'admin@chetana.com') {
              forumUid = 'admin';
              await pool.query('UPDATE users SET forum_uid = $1 WHERE id = $2', [forumUid, sanitizedUserId]);
            } else if (!forumUid) {
              // If regular user doesn't have forum_uid, generate one
              let isUnique = false;
              let attempts = 0;
              
              while (!isUnique && attempts < 10) {
                const randomCode = Math.random().toString(36).substring(2, 8);
                forumUid = `u/${randomCode}`;
                
                const checkResult = await pool.query('SELECT id FROM users WHERE forum_uid = $1', [forumUid]);
                if (checkResult.rows.length === 0) {
                  isUnique = true;
                }
                attempts++;
              }
              
              if (!isUnique) {
                forumUid = `u/${Date.now().toString(36)}`;
              }
              
              await pool.query('UPDATE users SET forum_uid = $1 WHERE id = $2', [forumUid, sanitizedUserId]);
            }
            
            // Get or create aura record
            let auraResult = await pool.query('SELECT aura_points FROM forum_aura WHERE user_uid = $1', [forumUid]);
            
            if (auraResult.rows.length === 0) {
              await pool.query('INSERT INTO forum_aura (user_uid, aura_points) VALUES ($1, $2)', [forumUid, 0]);
              auraResult = await pool.query('SELECT aura_points FROM forum_aura WHERE user_uid = $1', [forumUid]);
            }

            await pool.end();
            return res.json({ 
              success: true, 
              username: forumUid, 
              auraPoints: auraResult.rows[0].aura_points 
            });
          } catch (dbError) {
            console.error('Forum user DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        } else if (req.method === 'POST') {
          const { userId, auraChange } = req.body;
          
          if (!userId || auraChange === undefined) {
            return res.status(400).json({ error: 'User ID and aura change required' });
          }

          const sanitizedUserId = parseInt(userId);
          if (isNaN(sanitizedUserId) || sanitizedUserId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
          }

          try {
            // Get user's forum UID
            const userResult = await pool.query('SELECT forum_uid FROM users WHERE id = $1', [sanitizedUserId]);
            
            if (userResult.rows.length === 0) {
              await pool.end();
              return res.status(404).json({ error: 'User not found' });
            }
            
            const forumUid = userResult.rows[0].forum_uid;
            
            await pool.query('UPDATE forum_aura SET aura_points = GREATEST(0, aura_points + $1) WHERE user_uid = $2', [auraChange, forumUid]);
            const result = await pool.query('SELECT aura_points FROM forum_aura WHERE user_uid = $1', [forumUid]);

            await pool.end();
            return res.json({ success: true, auraPoints: result.rows[0]?.aura_points || 0 });
          } catch (dbError) {
            console.error('Forum aura update DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        }
        break;

      case 'stats':
        if (req.method === 'GET') {
          try {
            const postsResult = await pool.query('SELECT COUNT(*) as count FROM forum_posts');
            const commentsResult = await pool.query('SELECT COUNT(*) as count FROM forum_comments');
            const usersResult = await pool.query('SELECT COUNT(DISTINCT user_uid) as count FROM forum_memberships');
            
            // Get member counts by community
            const communityStats = await pool.query(`
              SELECT community, COUNT(*) as member_count 
              FROM forum_memberships 
              GROUP BY community
            `);
            
            const communities = {};
            communityStats.rows.forEach(row => {
              communities[row.community] = parseInt(row.member_count);
            });
            
            await pool.end();
            return res.json({
              success: true,
              stats: {
                totalPosts: parseInt(postsResult.rows[0].count),
                totalComments: parseInt(commentsResult.rows[0].count),
                totalUsers: parseInt(usersResult.rows[0].count),
                communities
              }
            });
          } catch (dbError) {
            console.error('Forum stats DB error:', dbError);
            await pool.end();
            return res.status(500).json({ success: false, error: 'Database connection failed' });
          }
        }
        break;

      case 'report':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { type, id, reason, reporterUid } = req.body;
        
        if (!type || !id || !reason || !reporterUid) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Input validation
        if (!['post', 'comment'].includes(type)) {
          return res.status(400).json({ error: 'Invalid report type' });
        }
        
        const parsedId = parseInt(id);
        if (isNaN(parsedId) || parsedId <= 0) {
          return res.status(400).json({ error: 'Invalid content ID' });
        }
        
        const sanitizedReason = sanitizeInput(reason);
        const sanitizedReporterUid = sanitizeInput(reporterUid);
        
        if (sanitizedReason.length < 5 || sanitizedReason.length > 500) {
          return res.status(400).json({ error: 'Reason must be between 5 and 500 characters' });
        }

        try {
          await pool.query('INSERT INTO forum_reports (type, content_id, reason, reporter_uid) VALUES ($1, $2, $3, $4)', [type, parsedId, sanitizedReason, sanitizedReporterUid]);
          await pool.end();
          return res.json({ success: true });
        } catch (dbError) {
          console.error('Forum report DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'reports':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        try {
          const reports = await pool.query(`
            SELECT r.*, 
                   CASE 
                       WHEN r.type = 'post' THEN p.title
                       WHEN r.type = 'comment' THEN c.content
                   END as content_preview,
                   CASE 
                       WHEN r.type = 'post' THEN p.author_uid
                       WHEN r.type = 'comment' THEN c.author_uid
                   END as author_uid
            FROM forum_reports r
            LEFT JOIN forum_posts p ON r.type = 'post' AND r.content_id = p.id
            LEFT JOIN forum_comments c ON r.type = 'comment' AND r.content_id = c.id
            WHERE r.status = 'pending'
            ORDER BY r.created_at DESC
          `);
          
          await pool.end();
          return res.json(reports.rows);
        } catch (dbError) {
          console.error('Forum reports DB error:', dbError);
          await pool.end();
          return res.json([]);
        }

      case 'join':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { community, userUid, action: joinAction } = req.body;
        
        if (!community || !userUid || !joinAction) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Input validation
        if (!VALID_COMMUNITIES.includes(community)) {
          return res.status(400).json({ error: 'Invalid community' });
        }
        
        if (!['join', 'leave'].includes(joinAction)) {
          return res.status(400).json({ error: 'Invalid action' });
        }
        
        const sanitizedUserUid = sanitizeInput(userUid, false);

        try {
          if (joinAction === 'join') {
            await pool.query('INSERT INTO forum_memberships (user_uid, community) VALUES ($1, $2) ON CONFLICT (user_uid, community) DO NOTHING', [sanitizedUserUid, community]);
          } else if (joinAction === 'leave') {
            await pool.query('DELETE FROM forum_memberships WHERE user_uid = $1 AND community = $2', [sanitizedUserUid, community]);
          }
          
          await pool.end();
          return res.json({ success: true });
        } catch (dbError) {
          console.error('Forum join/leave DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'memberships':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { userUid: memberUserUid } = req.query;
        
        if (!memberUserUid) {
          return res.status(400).json({ error: 'User UID required' });
        }

        const sanitizedMemberUserUid = sanitizeInput(memberUserUid, false);

        try {
          const result = await pool.query('SELECT community FROM forum_memberships WHERE user_uid = $1', [sanitizedMemberUserUid]);
          const memberships = result.rows.map(row => row.community);
          
          await pool.end();
          return res.json({ success: true, memberships });
        } catch (dbError) {
          console.error('Forum memberships DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'pin':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { commentId: pinCommentId, postId: pinPostId, pinnerUid } = req.body;
        
        if ((!pinCommentId && !pinPostId) || !pinnerUid) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user is admin
        const isAdmin = pinnerUid === 'u/kklt3o' || pinnerUid === 'admin@chetana.com' || pinnerUid === 'admin';
        if (!isAdmin) {
          await pool.end();
          return res.status(403).json({ error: 'Only admins can pin content' });
        }

        try {
          let result;
          if (pinCommentId) {
            result = await pool.query('UPDATE forum_comments SET pinned = NOT pinned WHERE id = $1 RETURNING pinned', [pinCommentId]);
          } else if (pinPostId) {
            result = await pool.query('UPDATE forum_posts SET pinned = NOT pinned WHERE id = $1 RETURNING pinned', [pinPostId]);
          }
          
          await pool.end();
          if (result.rows.length > 0) {
            return res.json({ success: true, pinned: result.rows[0].pinned });
          } else {
            return res.status(404).json({ error: 'Content not found' });
          }
        } catch (dbError) {
          console.error('Forum pin DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'delete-content':
        if (req.method !== 'DELETE') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { type: deleteType, id: deleteId, authorUid: deleteAuthorUid } = req.body;
        
        if (!deleteType || !deleteId || !deleteAuthorUid) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Input validation
        if (!['post', 'comment'].includes(deleteType)) {
          return res.status(400).json({ error: 'Invalid content type' });
        }
        
        if (!Number.isInteger(deleteId) || deleteId <= 0) {
          return res.status(400).json({ error: 'Invalid content ID' });
        }
        
        const sanitizedDeleteAuthorUid = sanitizeInput(deleteAuthorUid, false);

        try {
          let result;
          if (deleteType === 'post') {
            // Check if user owns the post or is admin
            const postCheck = await pool.query('SELECT author_uid FROM forum_posts WHERE id = $1', [deleteId]);
            if (postCheck.rows.length === 0) {
              await pool.end();
              return res.status(404).json({ error: 'Post not found' });
            }
            
            const isOwner = postCheck.rows[0].author_uid === sanitizedDeleteAuthorUid;
            const isAdmin = sanitizedDeleteAuthorUid === 'u/kklt3o' || sanitizedDeleteAuthorUid === 'admin@chetana.com' || sanitizedDeleteAuthorUid === 'admin';
            
            if (!isOwner && !isAdmin) {
              await pool.end();
              return res.status(403).json({ error: 'Not authorized to delete this post' });
            }
            
            // Delete post and its comments
            await pool.query('DELETE FROM forum_comments WHERE post_id = $1', [deleteId]);
            result = await pool.query('DELETE FROM forum_posts WHERE id = $1', [deleteId]);
          } else if (deleteType === 'comment') {
            // Check if user owns the comment or is admin
            const commentCheck = await pool.query('SELECT author_uid FROM forum_comments WHERE id = $1', [deleteId]);
            if (commentCheck.rows.length === 0) {
              await pool.end();
              return res.status(404).json({ error: 'Comment not found' });
            }
            
            const isOwner = commentCheck.rows[0].author_uid === sanitizedDeleteAuthorUid;
            const isAdmin = sanitizedDeleteAuthorUid === 'u/kklt3o' || sanitizedDeleteAuthorUid === 'admin@chetana.com' || sanitizedDeleteAuthorUid === 'admin';
            
            if (!isOwner && !isAdmin) {
              await pool.end();
              return res.status(403).json({ error: 'Not authorized to delete this comment' });
            }
            
            result = await pool.query('DELETE FROM forum_comments WHERE id = $1', [deleteId]);
          }
          
          await pool.end();
          if (result.rowCount > 0) {
            return res.json({ success: true });
          } else {
            return res.status(404).json({ error: 'Content not found' });
          }
        } catch (dbError) {
          console.error('Forum delete content DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'resolve-report':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { reportId, action: resolveAction } = req.body;
        
        if (!reportId || !resolveAction) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
          const reportResult = await pool.query('SELECT * FROM forum_reports WHERE id = $1', [reportId]);
          
          if (reportResult.rows.length === 0) {
            await pool.end();
            return res.status(404).json({ error: 'Report not found' });
          }

          const report = reportResult.rows[0];

          if (resolveAction === 'delete') {
            if (report.type === 'post') {
              await pool.query('DELETE FROM forum_posts WHERE id = $1', [report.content_id]);
              await pool.query('DELETE FROM forum_comments WHERE post_id = $1', [report.content_id]);
            } else if (report.type === 'comment') {
              await pool.query('DELETE FROM forum_comments WHERE id = $1', [report.content_id]);
            }
          }

          await pool.query('UPDATE forum_reports SET status = $1, resolved_at = NOW() WHERE id = $2', [resolveAction === 'delete' ? 'deleted' : 'dismissed', reportId]);
          
          await pool.end();
          return res.json({ success: true });
        } catch (dbError) {
          console.error('Forum resolve report DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'cleanup-duplicates':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        try {
          // Remove duplicate welcome posts, keep only the oldest one per community
          const result = await pool.query(`
            DELETE FROM forum_posts 
            WHERE id NOT IN (
              SELECT MIN(id) 
              FROM forum_posts 
              WHERE (title ILIKE '%welcome%' OR title ILIKE '%community guidelines%') AND author_uid = 'admin'
              GROUP BY community
            )
            AND (title ILIKE '%welcome%' OR title ILIKE '%community guidelines%') AND author_uid = 'admin'
          `);
          
          await pool.end();
          return res.json({ success: true, message: `Removed ${result.rowCount} duplicate welcome posts` });
        } catch (dbError) {
          console.error('Cleanup duplicates DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      case 'community-rules':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const { community: rulesCommunity } = req.query;
        
        if (!rulesCommunity) {
          return res.status(400).json({ error: 'Community parameter required' });
        }
        
        if (!VALID_COMMUNITIES.includes(rulesCommunity)) {
          return res.status(400).json({ error: 'Invalid community' });
        }

        try {
          const result = await pool.query('SELECT rules FROM forum_community_rules WHERE community = $1', [rulesCommunity]);
          
          await pool.end();
          if (result.rows.length === 0) {
            return res.json({ success: true, rules: 'No rules found for this community.' });
          }
          
          return res.json({ success: true, rules: result.rows[0].rules });
        } catch (dbError) {
          console.error('Forum community rules DB error:', dbError);
          await pool.end();
          return res.status(500).json({ success: false, error: 'Database connection failed' });
        }

      default:
        await pool.end();
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    console.error('Forum API error:', err);
    res.status(500).json({ error: err.message });
  }
};
