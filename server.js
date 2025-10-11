import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      mediaSrc: ["'self'"],
      scriptSrcAttr: ["'unsafe-inline'"]
    }
  },
  crossOriginEmbedderPolicy: false
};

app.use(helmet(helmetConfig));

// Rate limiting configuration
const rateLimitConfig = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    skip: (req) => {
      // Skip rate limiting for static files
      return req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
             req.url === '/favicon.ico' ||
             req.url === '/';
    }
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: { error: 'Too many login attempts, please try again later.' },
    skipSuccessfulRequests: true
  }
};

const generalLimiter = rateLimit(rateLimitConfig.general);
const authLimiter = rateLimit(rateLimitConfig.auth);
const mediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many media requests' }
});

app.use('/api/media', mediaLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use(generalLimiter);

// Database connection with robust error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 10000,
  allowExitOnIdle: false
});

// Connection pool event listeners
pool.on('connect', () => {
  console.log('🔗 Database client connected');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't exit process, let retry logic handle it
});

pool.on('remove', () => {
  console.log('🔌 Database client removed from pool');
});

// Connection monitoring and health check
let connectionHealthy = true;
let lastHealthCheck = Date.now();

setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    if (!connectionHealthy) {
      console.log('✅ Database connection restored');
      connectionHealthy = true;
    }
    lastHealthCheck = Date.now();
  } catch (err) {
    if (connectionHealthy) {
      console.error('❌ Database connection lost:', err.message);
      connectionHealthy = false;
    }
  }
}, 30000); // Check every 30 seconds

// Graceful connection cleanup
const cleanupConnections = async () => {
  try {
    await pool.end();
    console.log('✅ Database connections closed gracefully');
  } catch (err) {
    console.error('❌ Error closing database connections:', err.message);
  }
};

// Database query wrapper with retry logic
async function queryWithRetry(query, params = [], maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(query, params);
      client.release();
      return result;
    } catch (err) {
      if (client) client.release(true); // Release with error flag
      
      const isRetryableError = err.code === 'ECONNRESET' || 
                              err.code === 'ENOTFOUND' || 
                              err.code === 'ECONNREFUSED' ||
                              err.message.includes('Connection terminated') ||
                              err.message.includes('connection is closed');
      
      if (attempt < maxRetries && isRetryableError) {
        console.log(`🔄 Retrying query (${attempt}/${maxRetries}) in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      console.error(`❌ Query failed after ${attempt} attempts:`, err.message);
      throw err;
    }
  }
}

// CORS configuration
const corsConfig = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
};

app.use(cors(corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    // Sanitize string inputs
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key].trim());
      }
    });
  }
  next();
};

app.use(validateInput);

// Initialize database tables with retry logic
async function initDB() {
  const maxRetries = 5;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let client;
    try {
      console.log(`🔌 Connecting to database... (attempt ${attempt}/${maxRetries})`);
      
      // Test connection
      client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connected successfully');
      
      // Create all necessary tables using queryWithRetry
      await queryWithRetry(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, dob DATE, health_data_consent BOOLEAN DEFAULT TRUE, analytics_consent BOOLEAN DEFAULT FALSE, research_consent BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, forum_uid VARCHAR(20) UNIQUE, isadmin BOOLEAN DEFAULT FALSE)`);
      
      await queryWithRetry(`CREATE TABLE IF NOT EXISTS assessments (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, phq9_score INTEGER, gad7_score INTEGER, pss_score INTEGER, assessment_date DATE DEFAULT CURRENT_DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      
      await queryWithRetry(`CREATE TABLE IF NOT EXISTS mood_entries (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, mood_date DATE NOT NULL, mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, mood_date))`);
      
      await queryWithRetry(`CREATE TABLE IF NOT EXISTS milestones (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, milestone_id VARCHAR(50) NOT NULL, icon VARCHAR(10) NOT NULL, title VARCHAR(100) NOT NULL, description TEXT NOT NULL, achieved_date DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, milestone_id))`);
      
      await queryWithRetry(`CREATE TABLE IF NOT EXISTS journal_entries (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, entry_text TEXT NOT NULL, entry_date DATE DEFAULT CURRENT_DATE, mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      
      await queryWithRetry(`CREATE TABLE IF NOT EXISTS activity_planner (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, day_name VARCHAR(20) NOT NULL, activities TEXT[], created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, day_name))`);
      
      console.log('✅ Database tables initialized successfully');
      console.log('📅 Activity planner table: user_id, day_name, activities[]');
      console.log('📝 Journal entries table: user_id, entry_text, mood_rating, entry_date');
      return;
      
    } catch (err) {
      if (client) client.release(true);
      
      console.error(`❌ Database init attempt ${attempt} failed:`, err.message);
      
      if (attempt >= maxRetries) {
        console.error('❌ All database connection attempts failed.');
        console.error('💡 Troubleshooting:');
        console.error('   1. Check DATABASE_URL in .env file');
        console.error('   2. Verify database server is running');
        console.error('   3. Check network connectivity');
        console.error('   4. Verify SSL settings');
        throw err;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff
      console.log(`🔄 Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check route with database connectivity
app.get('/api/health', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as db_time, version() as db_version');
    client.release();
    
    res.json({ 
      status: 'OK', 
      message: 'Server and database are running', 
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        time: result.rows[0].db_time,
        version: result.rows[0].db_version.split(' ')[0]
      },
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    });
  } catch (err) {
    if (client) client.release(true);
    console.error('❌ Database health check failed:', err.message);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed', 
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: err.message
      }
    });
  }
});

// Routes
app.all('/api/users', async (req, res) => {
  const { action } = req.query;
  
  if (action === 'login' && req.method === 'POST') {
    // Handle login directly here
    try {
      console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }
      
      // Admin login
      if (email === 'admin@chetana.com' && password === 'admin123') {
        return res.json({
          success: true,
          isAdmin: true,
          token: 'admin-token',
          user: { id: 1, name: 'Admin', email: 'admin@chetana.com', isAdmin: true }
        });
      }
      
      // Database login
      const result = await queryWithRetry('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      res.json({ 
        success: true, 
        token, 
        user: { id: user.id, name: user.name, email: user.email } 
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
    return;
  }
  
  if (action === 'register' && req.method === 'POST') {
    // Redirect to register handler
    req.url = '/api/register';
    return app._router.handle(req, res);
  }
  
  if (action === 'admin' && req.method === 'GET') {
    console.log('📊 Admin action requested, redirecting to admin users endpoint');
    // Redirect to admin handler
    req.url = '/api/admin/users';
    return app._router.handle(req, res);
  }
  
  res.status(404).json({ success: false, error: 'Invalid action' });
});

app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    const { name, email, password, dob } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
    }
    
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await queryWithRetry(
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
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Admin check
    if (email === 'admin@chetana.com' && password === 'admin123') {
      // Get or create admin user with proper ID
      try {
        let adminResult = await queryWithRetry('SELECT * FROM users WHERE email = $1', ['admin@chetana.com']);
        
        if (adminResult.rows.length === 0) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          adminResult = await queryWithRetry(
            'INSERT INTO users (name, email, password, isadmin) VALUES ($1, $2, $3, $4) RETURNING *',
            ['Admin', 'admin@chetana.com', hashedPassword, true]
          );
        }
        
        const adminUser = adminResult.rows[0];
        const token = jwt.sign({ userId: adminUser.id, isAdmin: true }, process.env.JWT_SECRET);
        console.log('Admin login successful');
        return res.json({ 
          success: true, 
          isAdmin: true, 
          token, 
          user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, isAdmin: true } 
        });
      } catch (adminErr) {
        console.error('Admin user error:', adminErr);
        // Fallback to original behavior
        const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);
        return res.json({ success: true, isAdmin: true, token });
      }
    }
    
    // Demo user check
    if (email === 'demo@chetana.com' && password === 'demo123') {
      try {
        let demoUserResult = await queryWithRetry('SELECT * FROM users WHERE email = $1', ['demo@chetana.com']);
        
        if (demoUserResult.rows.length === 0) {
          const hashedPassword = await bcrypt.hash('demo123', 10);
          demoUserResult = await queryWithRetry(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            ['Demo User', 'demo@chetana.com', hashedPassword]
          );
        }
        
        const demoUser = demoUserResult.rows[0];
        const token = jwt.sign({ userId: demoUser.id }, process.env.JWT_SECRET);
        console.log('Demo user login successful');
        return res.json({ 
          success: true, 
          token, 
          user: { id: demoUser.id, name: demoUser.name, email: demoUser.email } 
        });
      } catch (demoUserErr) {
        console.error('Demo user error:', demoUserErr);
      }
    }
    
    // Dummy test user login - ensure user exists in database
    if (email === 'test@test.com' && password === '123456') {
      try {
        // Check if test user exists, create if not
        let testUserResult = await queryWithRetry('SELECT * FROM users WHERE email = $1', ['test@test.com']);
        
        if (testUserResult.rows.length === 0) {
          const hashedPassword = await bcrypt.hash('123456', 10);
          testUserResult = await queryWithRetry(
            'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [999, 'Test User', 'test@test.com', hashedPassword]
          );
        }
        
        const testUser = testUserResult.rows[0];
        const token = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET);
        console.log('Test user login successful');
        return res.json({ 
          success: true, 
          token, 
          user: { id: testUser.id, name: testUser.name, email: testUser.email } 
        });
      } catch (testUserErr) {
        console.error('Test user creation error:', testUserErr);
        // Fallback to original behavior
        const token = jwt.sign({ userId: 999 }, process.env.JWT_SECRET);
        return res.json({ 
          success: true, 
          token, 
          user: { id: 999, name: 'Test User', email: 'test@test.com' } 
        });
      }
    }
    
    const result = await queryWithRetry('SELECT * FROM users WHERE email = $1', [email]);
    
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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/assessments', async (req, res) => {
  try {
    let { userId, phq9, gad7, pss, assessmentDate } = req.body;
    
    // Handle admin string ID - convert to admin user ID from database
    if (userId === 'admin') {
      try {
        const adminResult = await queryWithRetry('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
        if (adminResult.rows.length > 0) {
          userId = adminResult.rows[0].id;
        } else {
          return res.status(400).json({ error: 'Admin user not found' });
        }
      } catch (adminErr) {
        console.error('Error finding admin user:', adminErr);
        return res.status(400).json({ error: 'Admin user lookup failed' });
      }
    }
    
    // Input validation
    if (!userId || !Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ error: 'Valid user ID required' });
    }
    
    userId = parseInt(userId);
    
    if (!Number.isInteger(phq9) || phq9 < 0 || phq9 > 27) {
      return res.status(400).json({ error: 'Invalid PHQ-9 score' });
    }
    
    if (!Number.isInteger(gad7) || gad7 < 0 || gad7 > 21) {
      return res.status(400).json({ error: 'Invalid GAD-7 score' });
    }
    
    if (!Number.isInteger(pss) || pss < 0 || pss > 40) {
      return res.status(400).json({ error: 'Invalid PSS score' });
    }
    
    const dateToUse = assessmentDate || new Date().toLocaleDateString('en-CA');
    
    const result = await queryWithRetry(
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
    
    // Handle admin string ID - convert to admin user ID from database
    let actualUserId = userId;
    if (userId === 'admin') {
      try {
        const adminResult = await queryWithRetry('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
        if (adminResult.rows.length > 0) {
          actualUserId = adminResult.rows[0].id;
        } else {
          console.log('❌ Admin user not found in database');
          return res.json({ success: true, assessments: [] });
        }
      } catch (adminErr) {
        console.error('❌ Error finding admin user:', adminErr);
        return res.json({ success: true, assessments: [] });
      }
    }
    
    // Validate that actualUserId is a number
    if (isNaN(parseInt(actualUserId))) {
      console.log('❌ Invalid userId format:', actualUserId);
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    
    console.log('🔍 Fetching assessments for user:', actualUserId);
    const result = await queryWithRetry(
      'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date DESC, created_at DESC',
      [parseInt(actualUserId)]
    );
    
    console.log('✅ Found', result.rows.length, 'assessments for user', actualUserId);
    res.json({ success: true, assessments: result.rows });
  } catch (err) {
    console.error('❌ Assessment fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch assessments: ' + err.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    console.log('📊 Admin endpoint: Fetching users and assessments data');
    
    const usersResult = await queryWithRetry(`
      SELECT u.id, u.name, u.email, 
             TO_CHAR(u.dob, 'YYYY-MM-DD') as dob, 
             u.created_at, COUNT(a.id) as assessment_count,
             MAX(a.assessment_date) as last_assessment
      FROM users u 
      LEFT JOIN assessments a ON u.id = a.user_id 
      WHERE (u.isadmin IS NULL OR u.isadmin = false)
      GROUP BY u.id, u.name, u.email, u.dob, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    console.log('📊 Admin endpoint: Found', usersResult.rows.length, 'users');
    console.log('📊 Admin endpoint: Sample user data:', usersResult.rows[0]);
    
    const totalAssessments = await queryWithRetry('SELECT COUNT(*) as total FROM assessments');
    const assessmentCount = parseInt(totalAssessments.rows[0].total) || 0;
    
    console.log('📊 Admin endpoint: Total assessments count:', assessmentCount);
    
    const responseData = { 
      users: usersResult.rows,
      totalUsers: usersResult.rows.length,
      totalAssessments: assessmentCount
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('❌ Admin users endpoint error:', err);
    res.status(500).json({ error: 'Failed to fetch admin data: ' + err.message });
  }
});

app.delete('/api/admin/users', async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('🗑️ Admin delete user request for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter required' });
    }
    
    const result = await queryWithRetry('DELETE FROM users WHERE id = $1', [userId]);
    
    console.log('🗑️ User deletion result:', result.rowCount, 'rows affected');
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User deleted successfully:', userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
});

app.post('/api/moods', async (req, res) => {
  try {
    let { userId, moodDate, moodRating } = req.body;
    
    // Input validation
    if (!userId || !moodDate || !moodRating) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Handle admin string ID - convert to admin user ID from database
    if (userId === 'admin') {
      try {
        const adminResult = await queryWithRetry('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
        if (adminResult.rows.length > 0) {
          userId = adminResult.rows[0].id;
        } else {
          return res.status(400).json({ success: false, error: 'Admin user not found' });
        }
      } catch (adminErr) {
        console.error('Error finding admin user:', adminErr);
        return res.status(400).json({ success: false, error: 'Admin user lookup failed' });
      }
    }
    
    if (!Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID' 
      });
    }
    
    userId = parseInt(userId);
    
    if (!validator.isDate(moodDate)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid date format' 
      });
    }
    
    if (!Number.isInteger(moodRating) || moodRating < 1 || moodRating > 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mood rating must be between 1 and 10' 
      });
    }

    const result = await queryWithRetry(`
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

    // Handle admin string ID - convert to admin user ID from database
    let actualUserId = userId;
    if (userId === 'admin') {
      try {
        const adminResult = await queryWithRetry('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
        if (adminResult.rows.length > 0) {
          actualUserId = adminResult.rows[0].id;
        } else {
          return res.json({ success: true, moods: [] });
        }
      } catch (adminErr) {
        console.error('Error finding admin user:', adminErr);
        return res.json({ success: true, moods: [] });
      }
    }
    
    // Validate that actualUserId is a number
    if (isNaN(parseInt(actualUserId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid userId format' 
      });
    }

    const result = await queryWithRetry(`
      SELECT * FROM mood_entries 
      WHERE user_id = $1 
      AND mood_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY mood_date DESC
    `, [parseInt(actualUserId)]);

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
    
    const result = await queryWithRetry(
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
    let { userId, milestoneId, icon, title, description, achievedDate } = req.body;
    
    if (!userId || !milestoneId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Handle admin string ID - convert to admin user ID from database
    if (userId === 'admin') {
      try {
        const adminResult = await queryWithRetry('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
        if (adminResult.rows.length > 0) {
          userId = adminResult.rows[0].id;
        } else {
          return res.status(400).json({ error: 'Admin user not found' });
        }
      } catch (adminErr) {
        console.error('Error finding admin user:', adminErr);
        return res.status(400).json({ error: 'Admin user lookup failed' });
      }
    }
    
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    userId = parseInt(userId);

    await queryWithRetry(
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

    // Handle admin string ID - convert to admin user ID from database
    let actualUserId = userId;
    if (userId === 'admin') {
      try {
        const adminResult = await queryWithRetry('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
        if (adminResult.rows.length > 0) {
          actualUserId = adminResult.rows[0].id;
        } else {
          return res.json({ success: true, milestones: [] });
        }
      } catch (adminErr) {
        console.error('Error finding admin user:', adminErr);
        return res.json({ success: true, milestones: [] });
      }
    }
    
    // Validate that actualUserId is a number
    if (isNaN(parseInt(actualUserId))) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const result = await queryWithRetry(
      'SELECT * FROM milestones WHERE user_id = $1 ORDER BY achieved_date DESC',
      [parseInt(actualUserId)]
    );

    res.json({ success: true, milestones: result.rows });
  } catch (err) {
    console.error('Milestone fetch error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.post('/api/init-db', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryWithRetry(`INSERT INTO users (name, email, password, isadmin) VALUES ('Admin', 'admin@chetana.com', $1, true) ON CONFLICT (email) DO NOTHING`, [hashedPassword]);
    
    const demoHashedPassword = await bcrypt.hash('demo123', 10);
    await queryWithRetry(`INSERT INTO users (name, email, password) VALUES ('Demo User', 'demo@chetana.com', $1) ON CONFLICT (email) DO NOTHING`, [demoHashedPassword]);
    
    const testHashedPassword = await bcrypt.hash('123456', 10);
    await queryWithRetry(`INSERT INTO users (id, name, email, password) VALUES (999, 'Test User', 'test@test.com', $1) ON CONFLICT (email) DO NOTHING`, [testHashedPassword]);
    
    res.json({ success: true, message: 'Database initialized with default users' });
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
    
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      
      // Delete user data in order (foreign key constraints)
      await client.query('DELETE FROM milestones WHERE user_id = $1', [id]);
      await client.query('DELETE FROM mood_entries WHERE user_id = $1', [id]);
      await client.query('DELETE FROM assessments WHERE user_id = $1', [id]);
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      client.release();
      
      console.log(`✅ User ${id} and all associated data deleted successfully`);
      res.json({ success: true, message: 'Account and all data deleted successfully' });
      
    } catch (err) {
      if (client) {
        await client.query('ROLLBACK');
        client.release(true);
      }
      throw err;
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
    const userResult = await queryWithRetry('SELECT id FROM users WHERE id = $1', [id]);
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
    
    await queryWithRetry(query, updateValues);
    
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

// Logout endpoint
app.post('/api/logout', (req, res) => {
  // Since we're using JWT tokens stored client-side, 
  // logout is handled by clearing the token on the client
  console.log('🚪 Logout request received');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Forum API - consolidated endpoint
app.all('/api/forum', async (req, res) => {
  try {
    const { default: forumHandler } = await import('./api/forum.js');
    return await forumHandler(req, res);
  } catch (err) {
    console.error('Forum handler error:', err);
    res.status(500).json({ error: 'Forum API error: ' + err.message });
  }
});

// Forum join endpoint
app.post('/api/forum/join', async (req, res) => {
  try {
    const { default: forumHandler } = await import('./api/forum.js');
    return await forumHandler(req, res);
  } catch (err) {
    console.error('Forum join error:', err);
    res.status(500).json({ error: 'Forum join error: ' + err.message });
  }
});

// Session API endpoint
app.all('/api/session', async (req, res) => {
  try {
    const { default: sessionHandler } = await import('./api/session.js');
    return await sessionHandler(req, res);
  } catch (err) {
    console.error('Session handler error:', err);
    res.status(500).json({ error: 'Session API error: ' + err.message });
  }
});

// Data API endpoint for moods, assessments, and milestones
app.all('/api/data', async (req, res) => {
  try {
    const { default: dataHandler } = await import('./api/data.js');
    return await dataHandler(req, res);
  } catch (err) {
    console.error('Data handler error:', err);
    res.status(500).json({ error: 'Data API error: ' + err.message });
  }
});



// Media API endpoint for environment videos and audio
app.get('/api/media', (req, res) => {
  const { environment, type } = req.query;
  
  if (!environment || !type) {
    return res.status(400).json({ error: 'Missing environment or type parameter' });
  }
  
  const validEnvironments = ['forest', 'ocean', 'rain', 'fireplace'];
  const validTypes = ['video', 'audio'];
  
  if (!validEnvironments.includes(environment) || !validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid environment or type' });
  }
  
  const extension = type === 'video' ? 'mp4' : 'mp3';
  const filePath = `${type}s/${environment}.${extension}`;
  
  // Set appropriate content type
  const contentType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');
  
  res.sendFile(filePath, { root: __dirname }, (err) => {
    if (err) {
      console.error('Media file not found:', filePath);
      // Return a 204 No Content instead of JSON error for media requests
      res.status(204).end();
    }
  });
});



// Catch-all route for debugging (exclude Chrome DevTools and well-known paths)
app.use('*', (req, res) => {
  // Ignore Chrome DevTools requests and other browser-specific requests
  if (req.originalUrl.includes('.well-known') || 
      req.originalUrl.includes('devtools') ||
      req.originalUrl.includes('chrome-extension') ||
      req.originalUrl.includes('favicon.ico') ||
      req.originalUrl.includes('manifest.json')) {
    return res.status(204).end(); // No Content response
  }
  console.log('🔴 Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ error: message });
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await cleanupConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await cleanupConnections();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  cleanupConnections().finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});

// Start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🗄️  Database: Connected to Neon PostgreSQL`);
    console.log(`🔧 Pool config: max=${pool.options.max}, min=${pool.options.min}`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  console.error('💡 Troubleshooting tips:');
  console.error('   - Check if DATABASE_URL is correct in .env file');
  console.error('   - Verify network connectivity to database');
  console.error('   - Ensure database server is running');
  process.exit(1);
});