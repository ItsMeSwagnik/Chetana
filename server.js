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
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize database tables
async function initDB() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        dob DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    const { userId, phq9, gad7, pss } = req.body;
    
    const result = await pool.query(
      'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, phq9, gad7, pss]
    );
    
    res.json({ success: true, assessment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

app.get('/api/assessments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date',
      [userId]
    );
    
    res.json({ assessments: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessments' });
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

app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
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