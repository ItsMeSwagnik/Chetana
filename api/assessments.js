const { Pool } = require('pg');

// Create pool instance per request for serverless
function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

module.exports = async function handler(req, res) {
  console.log('📊 Assessments API called:', {
    method: req.method,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pool = createPool();
    
    if (req.method === 'POST') {
      const { userId, phq9, gad7, pss, responses } = req.body;
      
      // Try with responses column first, fallback without it
      let result;
      try {
        result = await pool.query(
          'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score, responses) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [userId, phq9, gad7, pss, JSON.stringify(responses || {})]
        );
      } catch (err) {
        // Fallback if responses column doesn't exist
        result = await pool.query(
          'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score) VALUES ($1, $2, $3, $4) RETURNING *',
          [userId, phq9, gad7, pss]
        );
      }
      
      console.log('✅ Assessment saved:', { userId, scores: { phq9, gad7, pss }, timestamp: new Date().toISOString() });
      res.json({ success: true, assessment: result.rows[0] });
    } else if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId parameter required' });
      }
      
      let result;
      try {
        result = await pool.query(
          'SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );
      } catch (err) {
        // Fallback query if created_at column has issues
        result = await pool.query(
          'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
          [userId]
        );
      }
      
      console.log('📊 Found', result.rows.length, 'assessments for user', userId);
      res.json({ assessments: result.rows || [] });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Assessment error:', err);
    res.status(500).json({ error: 'Assessment operation failed: ' + err.message });
  }
}