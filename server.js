const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize database tables
async function initDB() {
  try {
    console.log('Connecting to database...');
    
    // Test connection with timeout
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        dob DATE,
        health_data_consent BOOLEAN DEFAULT TRUE,
        analytics_consent BOOLEAN DEFAULT FALSE,
        research_consent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        phq9_score INTEGER,
        gad7_score INTEGER,
        pss_score INTEGER,
        assessment_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
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
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        milestone_id VARCHAR(50) NOT NULL,
        icon VARCHAR(10) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        achieved_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, milestone_id)
      )
    `);
    
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    console.error('Full error:', err);
  }
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { name, email, password, dob } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, dob) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, dob]
    );
    
    console.log('User registered successfully:', result.rows[0]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Registration error:', err.message);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Admin check
    if (email === 'admin@chetana.com' && password === 'admin123') {
      const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);
      console.log('Admin login successful');
      return res.json({ success: true, isAdmin: true, token });
    }
    
    // Dummy test user login
    if (email === 'test@test.com' && password === '123456') {
      const token = jwt.sign({ userId: 999 }, process.env.JWT_SECRET);
      console.log('Test user login successful');
      return res.json({ 
        success: true, 
        token, 
        user: { id: 999, name: 'Test User', email: 'test@test.com' } 
      });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    console.log('User login successful:', user.email);
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

app.post('/api/assessments', async (req, res) => {
  try {
    const { userId, phq9, gad7, pss, assessmentDate } = req.body;
    const dateToUse = assessmentDate || new Date().toLocaleDateString('en-CA');
    
    const result = await pool.query(
      'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score, assessment_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, phq9, gad7, pss, dateToUse]
    );
    
    res.json({ success: true, assessment: result.rows[0] });
  } catch (err) {
    console.error('Save assessment error:', err);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

app.get('/api/assessments', async (req, res) => {
  console.log('📊 GET /api/assessments called with query:', req.query);
  try {
    const { userId } = req.query;
    
    if (!userId) {
      console.log('❌ Missing userId parameter');
      return res.status(400).json({ error: 'userId parameter required' });
    }
    
    console.log('🔍 Fetching assessments for user:', userId);
    const result = await pool.query(
      'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date DESC, created_at DESC',
      [userId]
    );
    
    console.log('✅ Found', result.rows.length, 'assessments for user', userId);
    res.json({ assessments: result.rows });
  } catch (err) {
    console.error('❌ Assessment fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch assessments: ' + err.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const usersResult = await pool.query(`
      SELECT u.*, COUNT(a.id) as assessment_count 
      FROM users u 
      LEFT JOIN assessments a ON u.id = a.user_id 
      GROUP BY u.id 
      ORDER BY u.created_at DESC
    `);
    
    const totalAssessments = await pool.query('SELECT COUNT(*) FROM assessments');
    
    res.json({ 
      users: usersResult.rows,
      totalUsers: usersResult.rows.length,
      totalAssessments: parseInt(totalAssessments.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

app.delete('/api/admin/users', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter required' });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('User deleted:', userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
});

app.post('/api/moods', async (req, res) => {
  try {
    const { userId, moodDate, moodRating } = req.body;
    
    if (!userId || !moodDate || !moodRating) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const result = await pool.query(`
      INSERT INTO mood_entries (user_id, mood_date, mood_rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, mood_date)
      DO UPDATE SET mood_rating = $3, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, moodDate, moodRating]);

    res.json({ 
      success: true, 
      mood: result.rows[0] 
    });
  } catch (err) {
    console.error('Mood save error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/moods', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID required' 
      });
    }

    const result = await pool.query(`
      SELECT * FROM mood_entries 
      WHERE user_id = $1 
      AND mood_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY mood_date DESC
    `, [userId]);

    res.json({ 
      success: true, 
      moods: result.rows 
    });
  } catch (err) {
    console.error('Mood fetch error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, email, dob FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/milestones', async (req, res) => {
  try {
    const { userId, milestoneId, icon, title, description, achievedDate } = req.body;
    
    if (!userId || !milestoneId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.query(
      'INSERT INTO milestones (user_id, milestone_id, icon, title, description, achieved_date) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id, milestone_id) DO NOTHING',
      [userId, milestoneId, icon, title, description, achievedDate || new Date().toISOString().split('T')[0]]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Milestone save error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/api/milestones', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await pool.query(
      'SELECT * FROM milestones WHERE user_id = $1 ORDER BY achieved_date DESC',
      [userId]
    );

    res.json({ success: true, milestones: result.rows });
  } catch (err) {
    console.error('Milestone fetch error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.post('/api/init-db', async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS isadmin BOOLEAN DEFAULT FALSE
    `);
    
    // Add consent columns for DPDP compliance
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS health_data_consent BOOLEAN DEFAULT TRUE
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT FALSE
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS research_consent BOOLEAN DEFAULT FALSE
    `);
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, isadmin) 
      VALUES ('Admin', 'admin@chetana.com', $1, true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    res.json({ success: true, message: 'Database initialized with default admin and DPDP compliance' });
  } catch (err) {
    res.status(500).json({ error: 'Database initialization failed: ' + err.message });
  }
});

// User deletion endpoint for DPDP compliance
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete user data in order (foreign key constraints)
      await client.query('DELETE FROM milestones WHERE user_id = $1', [id]);
      await client.query('DELETE FROM mood_entries WHERE user_id = $1', [id]);
      await client.query('DELETE FROM assessments WHERE user_id = $1', [id]);
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      
      console.log(`✅ User ${id} and all associated data deleted successfully`);
      res.json({ success: true, message: 'Account and all data deleted successfully' });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('❌ Delete user error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete account. Please try again.' 
    });
  }
});

// Consent management endpoint for DPDP compliance
app.put('/api/users/:id/consent', async (req, res) => {
  try {
    const { id } = req.params;
    const { healthDataConsent, analyticsConsent, researchConsent } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    
    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update consent preferences
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (healthDataConsent !== undefined) {
      updateFields.push(`health_data_consent = $${paramCount}`);
      updateValues.push(healthDataConsent);
      paramCount++;
    }
    
    if (analyticsConsent !== undefined) {
      updateFields.push(`analytics_consent = $${paramCount}`);
      updateValues.push(analyticsConsent);
      paramCount++;
    }
    
    if (researchConsent !== undefined) {
      updateFields.push(`research_consent = $${paramCount}`);
      updateValues.push(researchConsent);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No consent fields to update' });
    }
    
    updateValues.push(id);
    const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;
    
    await pool.query(query, updateValues);
    
    console.log(`✅ Consent preferences updated for user ${id}`);
    res.json({ success: true, message: 'Consent preferences updated successfully' });
    
  } catch (err) {
    console.error('❌ Update consent error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update consent preferences. Please try again.' 
    });
  }
});

// Forum API endpoints
app.get('/api/forum/user', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Generate unique username
    const randomCode = Math.random().toString(36).substring(2, 8);
    const username = `u/${randomCode}`;
    
    res.json({
      success: true,
      username: username,
      auraPoints: 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get forum user' });
  }
});

app.get('/api/forum/stats', async (req, res) => {
  try {
    const stats = {
      depression: Math.floor(Math.random() * 100) + 50,
      anxiety: Math.floor(Math.random() * 80) + 40,
      stress: Math.floor(Math.random() * 60) + 30
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/forum/join', async (req, res) => {
  try {
    const { community, action } = req.body;
    console.log(`User ${action}ed community: ${community}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join/leave community' });
  }
});

app.get('/api/forum/posts', async (req, res) => {
  try {
    const { community } = req.query;
    const samplePosts = [
      {
        id: 1,
        title: "Feeling overwhelmed lately",
        content: "I've been struggling with work stress and it's affecting my sleep. Anyone else going through something similar?",
        author: "u/anonymous123",
        created_at: new Date().toISOString(),
        votes: 5,
        comment_count: 3
      },
      {
        id: 2,
        title: "Small wins today",
        content: "Managed to go for a walk and call a friend. It's not much but it feels good to take these small steps.",
        author: "u/hopeful456",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        votes: 12,
        comment_count: 7
      }
    ];
    res.json(samplePosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/forum/posts', async (req, res) => {
  try {
    const { title, content, community, author } = req.body;
    const newPost = {
      id: Date.now(),
      title,
      content,
      author,
      community,
      created_at: new Date().toISOString(),
      votes: 0,
      comment_count: 0
    };
    console.log('New post created:', newPost);
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = {
      id: parseInt(id),
      title: "Sample Post",
      content: "This is a sample post content for demonstration.",
      author: "u/sample",
      created_at: new Date().toISOString(),
      votes: 3
    };
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.get('/api/forum/comments', async (req, res) => {
  try {
    const { postId } = req.query;
    const sampleComments = [
      {
        id: 1,
        content: "I can relate to this. Thanks for sharing.",
        author: "u/supporter",
        created_at: new Date().toISOString(),
        votes: 2,
        parent_id: null
      },
      {
        id: 2,
        content: "You're not alone in this journey.",
        author: "u/friend",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        votes: 4,
        parent_id: null
      }
    ];
    res.json(sampleComments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/forum/comments', async (req, res) => {
  try {
    const { content, postId, author } = req.body;
    const newComment = {
      id: Date.now(),
      content,
      author,
      postId: parseInt(postId),
      created_at: new Date().toISOString(),
      votes: 0
    };
    console.log('New comment created:', newComment);
    res.json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.post('/api/forum/vote', async (req, res) => {
  try {
    const { postId, type, author } = req.body;
    console.log(`${author} ${type}d post ${postId}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

app.post('/api/forum/vote-comment', async (req, res) => {
  try {
    const { commentId, type, author } = req.body;
    console.log(`${author} ${type}d comment ${commentId}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log('🔴 Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

// Start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🗄️  Database: Connected to Neon PostgreSQL`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});