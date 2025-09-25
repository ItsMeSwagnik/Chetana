const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

  const { action } = req.query;

  try {
    switch (action) {
      case 'login':
        const { email, password } = req.body || {};
        
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Demo accounts (always work)
        const demoAccounts = {
          'admin@chetana.com': { password: 'admin123', id: 1, name: 'Admin User', isAdmin: true },
          'test@test.com': { password: '123456', id: 999, name: 'Test User', isAdmin: false },
          'demo@chetana.com': { password: 'demo123', id: 1001, name: 'Demo User', isAdmin: false },
          'user@example.com': { password: 'password', id: 1002, name: 'Sample User', isAdmin: false }
        };
        
        const demoUser = demoAccounts[email];
        if (demoUser && demoUser.password === password) {
          const token = jwt.sign({ userId: demoUser.id, isAdmin: demoUser.isAdmin }, process.env.JWT_SECRET || 'fallback_secret');
          return res.json({ 
            success: true, 
            isAdmin: demoUser.isAdmin,
            token, 
            user: { id: demoUser.id, name: demoUser.name, email: email },
            offline: true
          });
        }
        
        // Try database connection
        try {
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
          });
          
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          
          if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          
          const user = result.rows[0];
          const validPassword = await bcrypt.compare(password, user.password);
          
          if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          
          const token = jwt.sign({ userId: user.id, isAdmin: user.isadmin }, process.env.JWT_SECRET || 'fallback_secret');
          
          await pool.end();
          
          return res.json({ 
            success: true, 
            isAdmin: user.isadmin,
            token, 
            user: { id: user.id, name: user.name, email: user.email } 
          });
        } catch (dbError) {
          console.error('Database connection failed:', dbError.message);
          return res.status(401).json({ error: 'Invalid credentials or database unavailable' });
        }

      case 'register':
        const { name, email: regEmail, password: regPassword, dob, isAdmin } = req.body || {};
        
        if (!name || !regEmail || !regPassword) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        
        try {
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
          });
          
          const hashedPassword = await bcrypt.hash(regPassword, 10);
          
          const regResult = await pool.query(
            'INSERT INTO users (name, email, password, dob, isadmin) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, isadmin',
            [name, regEmail, hashedPassword, dob, isAdmin || false]
          );
          
          await pool.end();
          
          return res.json({ success: true, user: regResult.rows[0] });
        } catch (dbError) {
          if (dbError.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          console.error('Database connection failed:', dbError.message);
          return res.status(500).json({ error: 'Registration failed - database unavailable' });
        }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    console.error('Auth API error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
};