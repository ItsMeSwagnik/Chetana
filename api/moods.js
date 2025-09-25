const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize mood table
async function initMoodTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mood_entries (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                mood_date DATE NOT NULL,
                mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, mood_date)
            )
        `);
        console.log('✅ Mood table initialized');
    } catch (err) {
        console.error('❌ Failed to initialize mood table:', err);
    }
}

initMoodTable();

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            // Save mood entry
            const { userId, moodDate, moodRating } = req.body;
            
            if (!userId || !moodDate || !moodRating) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields' 
                });
            }

            // Insert or update mood entry
            const result = await pool.query(`
                INSERT INTO mood_entries (user_id, mood_date, mood_rating)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, mood_date)
                DO UPDATE SET mood_rating = $3, created_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [userId, moodDate, moodRating]);

            return res.json({ 
                success: true, 
                mood: result.rows[0] 
            });

        } else if (req.method === 'GET') {
            // Get mood entries
            const { userId } = req.query;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'User ID required' 
                });
            }

            // Get all mood entries for user (last 30 days)
            const result = await pool.query(`
                SELECT * FROM mood_entries 
                WHERE user_id = $1 
                AND mood_date >= CURRENT_DATE - INTERVAL '30 days'
                ORDER BY mood_date DESC
            `, [userId]);

            return res.json({ 
                success: true, 
                moods: result.rows 
            });

        } else {
            return res.status(405).json({ 
                success: false, 
                error: 'Method not allowed' 
            });
        }

    } catch (err) {
        console.error('Mood API error:', err);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};