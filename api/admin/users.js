const { Pool } = require('pg');

// Create pool instance per request for serverless
function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

module.exports = async function handler(req, res) {
  console.log('👥 Admin Users API called:', {
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pool = createPool();
    
    if (req.method === 'GET') {
      let usersResult;
      try {
        usersResult = await pool.query(`
          SELECT u.*, 
                 COUNT(a.id) as assessment_count,
                 MAX(a.created_at) as last_assessment
          FROM users u 
          LEFT JOIN assessments a ON u.id = a.user_id 
          GROUP BY u.id 
          ORDER BY u.created_at DESC
        `);
      } catch (err) {
        // Fallback to simple user query
        console.log('Complex query failed, using simple query:', err.message);
        usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        // Add assessment_count as 0 for each user
        usersResult.rows = usersResult.rows.map(user => ({ ...user, assessment_count: 0 }));
      }
      
      let totalAssessments;
      try {
        totalAssessments = await pool.query('SELECT COUNT(*) FROM assessments');
      } catch (err) {
        totalAssessments = { rows: [{ count: '0' }] };
      }
      
      let recentAssessments = { rows: [{ count: '0' }] };
      try {
        recentAssessments = await pool.query(`
          SELECT COUNT(*) FROM assessments 
          WHERE created_at >= NOW() - INTERVAL '7 days'
        `);
      } catch (err) {
        try {
          recentAssessments = await pool.query(`
            SELECT COUNT(*) FROM assessments 
            WHERE assessment_date >= CURRENT_DATE - INTERVAL '7 days'
          `);
        } catch (err2) {
          // Keep default value
        }
      }
      
      res.json({ 
        users: usersResult.rows || [],
        totalUsers: (usersResult.rows || []).length,
        totalAssessments: parseInt(totalAssessments.rows[0].count) || 0,
        recentAssessments: parseInt(recentAssessments.rows[0].count) || 0
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