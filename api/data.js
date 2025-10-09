import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
    const { method, query } = req;
    const { type, action, userId } = query;
    const dataType = type || action;

    if (dataType === 'assessments') {
        if (method === 'POST') {
            const { userId, phq9, gad7, pss, responses, assessmentDate } = req.body;
            try {
                await pool.query(
                    'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score, responses, assessment_date) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, phq9, gad7, pss, JSON.stringify(responses), assessmentDate]
                );
                return res.json({ success: true, message: 'Assessment saved' });
            } catch (err) {
                return res.status(500).json({ success: false, error: 'Failed to save assessment' });
            }
        }
        if (method === 'GET' && userId) {
            try {
                const result = await pool.query(
                    'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
                    [userId]
                );
                return res.json({ success: true, assessments: result.rows });
            } catch (err) {
                return res.json({ success: true, assessments: [] });
            }
        }
    }

    if (dataType === 'moods') {
        if (method === 'POST') {
            const { userId, moodDate, moodRating } = req.body;
            try {
                await pool.query(
                    'INSERT INTO mood_entries (user_id, mood_date, mood_rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, mood_date) DO UPDATE SET mood_rating = $3',
                    [userId, moodDate, moodRating]
                );
                return res.json({ success: true, message: 'Mood saved' });
            } catch (err) {
                return res.status(500).json({ success: false, error: 'Failed to save mood' });
            }
        }
        if (method === 'GET' && userId) {
            try {
                const result = await pool.query(
                    'SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY mood_date DESC',
                    [userId]
                );
                return res.json({ success: true, moods: result.rows });
            } catch (err) {
                return res.json({ success: true, moods: [] });
            }
        }
    }

    if (dataType === 'milestones') {
        if (method === 'POST') {
            const { userId, milestoneId, icon, title, description, achievedDate } = req.body;
            try {
                await pool.query(
                    'INSERT INTO milestones (user_id, milestone_id, icon, title, description, achieved_date) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, milestoneId, icon, title, description, achievedDate]
                );
                return res.json({ success: true, message: 'Milestone saved' });
            } catch (err) {
                return res.status(500).json({ success: false, error: 'Failed to save milestone' });
            }
        }
        if (method === 'GET' && userId) {
            try {
                const result = await pool.query(
                    'SELECT * FROM milestones WHERE user_id = $1 ORDER BY achieved_date DESC',
                    [userId]
                );
                return res.json({ success: true, milestones: result.rows });
            } catch (err) {
                return res.json({ success: true, milestones: [] });
            }
        }
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}