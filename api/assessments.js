const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { userId, phq9, gad7, pss } = req.body;
      
      const result = await pool.query(
        'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, phq9, gad7, pss]
      );
      
      res.json({ success: true, assessment: result.rows[0] });
    } else if (req.method === 'GET') {
      const { userId } = req.query;
      
      const result = await pool.query(
        'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date',
        [userId]
      );
      
      res.json({ assessments: result.rows });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Assessment error:', err);
    res.status(500).json({ error: 'Assessment operation failed: ' + err.message });
  }
}