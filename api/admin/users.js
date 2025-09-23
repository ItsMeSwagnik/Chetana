const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
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
    } else if (req.method === 'DELETE') {
      const { userId } = req.query;
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      res.json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Admin operation failed: ' + err.message });
  }
}