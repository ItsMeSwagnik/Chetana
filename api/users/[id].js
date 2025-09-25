const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID required' 
            });
        }

        // Get user data
        const result = await pool.query(`
            SELECT id, name, email, dob, created_at, isadmin
            FROM users 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        return res.json({ 
            success: true, 
            user: result.rows[0] 
        });

    } catch (err) {
        console.error('User API error:', err);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};