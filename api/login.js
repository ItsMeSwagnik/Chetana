const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  console.log('🔐 Login API called:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
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
    console.log('📝 Environment check:', {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      dbUrlLength: process.env.DATABASE_URL?.length || 0
    });

    const { email, password } = req.body;
    console.log('📝 Login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Admin check
    if (email === 'admin@chetana.com' && password === 'admin123') {
      console.log('🔑 Admin login successful');
      const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);
      return res.json({ success: true, isAdmin: true, token });
    }
    
    // Test user login
    if (email === 'test@test.com' && password === '123456') {
      console.log('🧪 Test user login successful');
      const token = jwt.sign({ userId: 999 }, process.env.JWT_SECRET);
      return res.json({ 
        success: true, 
        token, 
        user: { id: 999, name: 'Test User', email: 'test@test.com' } 
      });
    }
    
    console.log('📊 Querying database for user:', email);
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('📊 Database query result:', { rowCount: result.rows.length });
    
    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    console.log('👤 User found:', { id: user.id, name: user.name, email: user.email });
    
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password validation:', { valid: validPassword });
    
    if (!validPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    console.log('✅ Login successful for user:', user.email);
    
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('🔴 Login error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}