const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize media table
async function initMediaTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS environment_media (
                id SERIAL PRIMARY KEY,
                environment VARCHAR(50) NOT NULL,
                media_type VARCHAR(10) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_data BYTEA NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                file_size INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(environment, media_type)
            )
        `);
        console.log('✅ Environment media table initialized');
    } catch (err) {
        console.error('❌ Error initializing media table:', err);
    }
}

module.exports = async (req, res) => {
    await initMediaTable();
    
    if (req.method === 'GET') {
        const { environment, type } = req.query;
        
        try {
            const result = await pool.query(
                'SELECT file_data, mime_type, file_name FROM environment_media WHERE environment = $1 AND media_type = $2',
                [environment, type]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Media not found' });
            }
            
            const media = result.rows[0];
            res.setHeader('Content-Type', media.mime_type);
            res.setHeader('Content-Disposition', `inline; filename="${media.file_name}"`);
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
            res.send(media.file_data);
            
        } catch (err) {
            console.error('Error fetching media:', err);
            res.status(500).json({ error: 'Failed to fetch media' });
        }
    }
    
    else if (req.method === 'POST') {
        // Upload media (admin only)
        const { environment, media_type, file_name, file_data, mime_type } = req.body;
        
        try {
            const fileBuffer = Buffer.from(file_data, 'base64');
            
            await pool.query(`
                INSERT INTO environment_media (environment, media_type, file_name, file_data, mime_type, file_size)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (environment, media_type) 
                DO UPDATE SET file_data = $4, mime_type = $5, file_size = $6, file_name = $3
            `, [environment, media_type, file_name, fileBuffer, mime_type, fileBuffer.length]);
            
            res.json({ success: true, message: 'Media uploaded successfully' });
            
        } catch (err) {
            console.error('Error uploading media:', err);
            res.status(500).json({ error: 'Failed to upload media' });
        }
    }
    
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};