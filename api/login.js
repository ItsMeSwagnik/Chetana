const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  // Enable CORS
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
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Test user login
    if (email === 'test@test.com' && password === '123456') {
      const token = jwt.sign({ userId: 999 }, process.env.JWT_SECRET || 'fallback_secret');
      return res.json({ 
        success: true, 
        token, 
        user: { id: 999, name: 'Test User', email: 'test@test.com' } 
      });
    }
    
    // Database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
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
    
    if (user.isadmin) {
      res.json({ 
        success: true, 
        isAdmin: true,
        token, 
        user: { id: user.id, name: user.name, email: user.email } 
      });
    } else {
      res.json({ 
        success: true, 
        token, 
        user: { id: user.id, name: user.name, email: user.email } 
      });
    }
    
  } catch (err) {
    console.error('Database connection failed:', err.message);
    
    // Fallback login options when database is unavailable
    if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      // Demo user accounts for offline mode
      const demoUsers = [
        { email: 'demo@chetana.com', password: 'demo123', id: 1001, name: 'Demo User' },
        { email: 'user@example.com', password: 'password', id: 1002, name: 'Sample User' }
      ];
      
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      if (demoUser) {
        const token = jwt.sign({ userId: demoUser.id }, process.env.JWT_SECRET || 'fallback_secret');
        return res.json({ 
          success: true, 
          token, 
          user: { id: demoUser.id, name: demoUser.name, email: demoUser.email },
          offline: true
        });
      }
    }
    
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}