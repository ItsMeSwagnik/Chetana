const { Pool } = require('pg');

// Database connection with timeout and error handling
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20
});

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'DELETE') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    try {
        const userId = req.url.split('/').pop();
        
        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Delete user data in order (foreign key constraints)
            await client.query('DELETE FROM milestones WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM moods WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM assessments WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM users WHERE id = $1', [userId]);
            
            await client.query('COMMIT');
            
            console.log(`✅ User ${userId} and all associated data deleted successfully`);
            res.json({ success: true, message: 'Account and all data deleted successfully' });
            
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        
    } catch (err) {
        console.error('❌ Delete user error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete account. Please try again.' 
        });
    }
};