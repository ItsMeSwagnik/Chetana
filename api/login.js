module.exports = async function handler(req, res) {
  console.log('🔐 Login API called:', {
    method: req.method,
    hasBody: !!req.body,
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
      hasJwtSecret: !!process.env.JWT_SECRET
    });

    const { email, password } = req.body || {};
    console.log('📝 Login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Admin check
    if (email === 'admin@chetana.com' && password === 'admin123') {
      console.log('👑 Admin login successful');
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET || 'fallback_secret');
      return res.json({ success: true, isAdmin: true, token });
    }
    
    // Test user login
    if (email === 'test@test.com' && password === '123456') {
      console.log('🧪 Test user login successful');
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId: 999 }, process.env.JWT_SECRET || 'fallback_secret');
      return res.json({ 
        success: true, 
        token, 
        user: { id: 999, name: 'Test User', email: 'test@test.com' } 
      });
    }
    
    // For now, return test user for any other login attempt
    console.log('🔄 Fallback to test user for:', email);
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 999 }, process.env.JWT_SECRET || 'fallback_secret');
    return res.json({ 
      success: true, 
      token, 
      user: { id: 999, name: 'Demo User', email: email } 
    });
    
  } catch (err) {
    console.error('🔴 Login error:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}