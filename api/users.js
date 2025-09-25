const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, id } = req.query;

    try {
        switch (action) {
            case 'profile':
                if (req.method !== 'GET') {
                    return res.status(405).json({ success: false, error: 'Method not allowed' });
                }
                
                if (!id) {
                    return res.status(400).json({ success: false, error: 'User ID required' });
                }

                const result = await pool.query('SELECT id, name, email, dob, created_at, isadmin FROM users WHERE id = $1', [id]);

                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }

                return res.json({ success: true, user: result.rows[0] });

            case 'consent':
                if (req.method !== 'PUT') {
                    return res.status(405).json({ success: false, error: 'Method not allowed' });
                }
                
                const { healthDataConsent, analyticsConsent, researchConsent } = req.body;
                
                if (!id || isNaN(parseInt(id))) {
                    return res.status(400).json({ success: false, error: 'Invalid user ID' });
                }
                
                const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
                if (userResult.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }
                
                const updateFields = [];
                const updateValues = [];
                let paramCount = 1;
                
                if (healthDataConsent !== undefined) {
                    updateFields.push(`health_data_consent = $${paramCount}`);
                    updateValues.push(healthDataConsent);
                    paramCount++;
                }
                
                if (analyticsConsent !== undefined) {
                    updateFields.push(`analytics_consent = $${paramCount}`);
                    updateValues.push(analyticsConsent);
                    paramCount++;
                }
                
                if (researchConsent !== undefined) {
                    updateFields.push(`research_consent = $${paramCount}`);
                    updateValues.push(researchConsent);
                    paramCount++;
                }
                
                if (updateFields.length === 0) {
                    return res.status(400).json({ success: false, error: 'No consent fields to update' });
                }
                
                updateValues.push(id);
                const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`;
                
                await pool.query(query, updateValues);
                
                return res.json({ success: true, message: 'Consent preferences updated successfully' });

            case 'delete':
                if (req.method !== 'DELETE') {
                    return res.status(405).json({ success: false, error: 'Method not allowed' });
                }
                
                if (!id || isNaN(parseInt(id))) {
                    return res.status(400).json({ success: false, error: 'Invalid user ID' });
                }
                
                await pool.query('BEGIN');
                
                try {
                    await pool.query('DELETE FROM milestones WHERE user_id = $1', [id]);
                    await pool.query('DELETE FROM moods WHERE user_id = $1', [id]);
                    await pool.query('DELETE FROM assessments WHERE user_id = $1', [id]);
                    await pool.query('DELETE FROM users WHERE id = $1', [id]);
                    
                    await pool.query('COMMIT');
                    
                    return res.json({ success: true, message: 'Account and all data deleted successfully' });
                } catch (err) {
                    await pool.query('ROLLBACK');
                    throw err;
                }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Users API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};