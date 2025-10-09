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
        if (method === 'GET' && userId) {
            try {
                const result = await pool.query(
                    'SELECT * FROM moods WHERE user_id = $1 ORDER BY mood_date DESC',
                    [userId]
                );
                return res.json({ success: true, moods: result.rows });
            } catch (err) {
                return res.json({ success: true, moods: [] });
            }
        }
    }

    if (dataType === 'milestones') {
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