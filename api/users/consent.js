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
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    try {
        const userId = req.url.split('/')[3]; // Extract user ID from URL
        const { healthDataConsent, analyticsConsent, researchConsent } = req.body;
        
        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        
        const client = await pool.connect();
        
        try {
            // Check if user exists
            const userResult = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            
            // Update consent preferences
            const updateFields = [];\n            const updateValues = [];\n            let paramCount = 1;\n            \n            if (healthDataConsent !== undefined) {\n                updateFields.push(`health_data_consent = $${paramCount}`);\n                updateValues.push(healthDataConsent);\n                paramCount++;\n            }\n            \n            if (analyticsConsent !== undefined) {\n                updateFields.push(`analytics_consent = $${paramCount}`);\n                updateValues.push(analyticsConsent);\n                paramCount++;\n            }\n            \n            if (researchConsent !== undefined) {\n                updateFields.push(`research_consent = $${paramCount}`);\n                updateValues.push(researchConsent);\n                paramCount++;\n            }\n            \n            if (updateFields.length === 0) {\n                return res.status(400).json({ success: false, error: 'No consent fields to update' });\n            }\n            \n            updateValues.push(userId);\n            const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;\n            \n            await client.query(query, updateValues);\n            \n            console.log(`✅ Consent preferences updated for user ${userId}`);\n            res.json({ success: true, message: 'Consent preferences updated successfully' });\n            \n        } finally {\n            client.release();\n        }\n        \n    } catch (err) {\n        console.error('❌ Update consent error:', err);\n        res.status(500).json({ \n            success: false, \n            error: 'Failed to update consent preferences. Please try again.' \n        });\n    }\n};