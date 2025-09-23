const bcrypt = require('bcrypt');
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

  let pool;
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
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
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
    res.status(500).json({ error: 'Login failed: ' + err.message });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}