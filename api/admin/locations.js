import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
    const { method } = req;
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Parse JSON body if needed
    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.error('Failed to parse JSON body:', e);
        }
    }
    
    if (method === 'POST') {
        const { userId, latitude, longitude, accuracy } = body || {};
        
        if (!userId || !latitude || !longitude) {
            return res.status(400).json({ success: false, error: 'User ID, latitude, and longitude are required' });
        }
        
        try {
            // Create locations table if it doesn't exist
            await pool.query(`
                CREATE TABLE IF NOT EXISTS user_locations (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    accuracy DECIMAL(10, 2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Insert location data
            await pool.query(
                'INSERT INTO user_locations (user_id, latitude, longitude, accuracy, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [userId, latitude, longitude, accuracy]
            );
            
            return res.json({ success: true, message: 'Location saved successfully' });
        } catch (err) {
            console.error('Location save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save location' });
        }
    }
    
    if (method === 'GET') {
        try {
            // Get all locations with user information
            const locationsResult = await pool.query(`
                SELECT 
                    ul.id,
                    ul.user_id,
                    ul.latitude,
                    ul.longitude,
                    ul.accuracy,
                    ul.created_at,
                    u.name,
                    u.email
                FROM user_locations ul
                LEFT JOIN users u ON ul.user_id = u.id
                ORDER BY ul.created_at DESC
            `);
            
            return res.json({
                success: true,
                locations: locationsResult.rows
            });
        } catch (err) {
            console.error('Locations fetch error:', err);
            return res.json({ success: true, locations: [] });
        }
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' });
}