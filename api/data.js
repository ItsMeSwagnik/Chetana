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

    if (dataType === 'journal') {
        if (method === 'POST') {
            let { userId, entryText, moodRating } = req.body;
            console.log('📝 Journal - Saving entry:', { userId, entryLength: entryText?.length, moodRating });
            
            if (userId === 'admin') {
                try {
                    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
                    userId = adminResult.rows.length > 0 ? adminResult.rows[0].id : 1;
                } catch (err) {
                    console.error('Admin lookup error:', err);
                    userId = 1;
                }
            }
            
            try {
                const result = await pool.query(
                    'INSERT INTO journal_entries (user_id, entry_text, mood_rating) VALUES ($1, $2, $3) RETURNING *',
                    [userId, entryText, moodRating]
                );
                console.log('✅ Journal entry saved successfully:', result.rows[0].id);
                return res.json({ success: true, message: 'Journal entry saved', data: result.rows[0] });
            } catch (err) {
                console.error('❌ Journal save error:', err);
                return res.status(500).json({ success: false, error: 'Failed to save journal entry: ' + err.message });
            }
        }
        if (method === 'GET' && userId) {
            let actualUserId = userId;
            if (userId === 'admin') {
                try {
                    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
                    actualUserId = adminResult.rows.length > 0 ? adminResult.rows[0].id : 1;
                } catch (err) {
                    console.error('Admin lookup error:', err);
                    actualUserId = 1;
                }
            }
            try {
                console.log('📝 Journal - Loading entries for user:', actualUserId);
                const result = await pool.query(
                    'SELECT *, TO_CHAR(entry_date, \'YYYY-MM-DD\') as formatted_date, TO_CHAR(created_at, \'YYYY-MM-DD HH24:MI\') as formatted_time FROM journal_entries WHERE user_id = $1 ORDER BY entry_date DESC, created_at DESC LIMIT 10',
                    [actualUserId]
                );
                console.log('📝 Journal - Found entries:', result.rows.length);
                return res.json({ success: true, entries: result.rows });
            } catch (err) {
                console.error('❌ Journal load error:', err);
                return res.json({ success: true, entries: [] });
            }
        }
    }

    if (dataType === 'activities') {
        if (method === 'POST') {
            let { userId, dayName, activities } = req.body;
            console.log('📅 Activity Planner - Saving data:', { userId, dayName, activities });
            
            if (userId === 'admin') {
                try {
                    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
                    userId = adminResult.rows.length > 0 ? adminResult.rows[0].id : 1;
                } catch (err) {
                    console.error('Admin lookup error:', err);
                    userId = 1;
                }
            }
            
            try {
                const result = await pool.query(
                    'INSERT INTO activity_planner (user_id, day_name, activities) VALUES ($1, $2, $3) ON CONFLICT (user_id, day_name) DO UPDATE SET activities = $3, updated_at = CURRENT_TIMESTAMP RETURNING *',
                    [userId, dayName, activities]
                );
                console.log('✅ Activity saved successfully:', result.rows[0]);
                return res.json({ success: true, message: 'Activities saved', data: result.rows[0] });
            } catch (err) {
                console.error('❌ Activity save error:', err);
                return res.status(500).json({ success: false, error: 'Failed to save activities: ' + err.message });
            }
        }
        if (method === 'GET' && userId) {
            let actualUserId = userId;
            if (userId === 'admin') {
                try {
                    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@chetana.com']);
                    actualUserId = adminResult.rows.length > 0 ? adminResult.rows[0].id : 1;
                } catch (err) {
                    console.error('Admin lookup error:', err);
                    actualUserId = 1;
                }
            }
            try {
                console.log('📅 Activity Planner - Loading data for user:', actualUserId);
                const result = await pool.query(
                    'SELECT * FROM activity_planner WHERE user_id = $1 ORDER BY day_name',
                    [actualUserId]
                );
                console.log('📅 Activity Planner - Found activities:', result.rows.length);
                return res.json({ success: true, activities: result.rows });
            } catch (err) {
                console.error('❌ Activity load error:', err);
                return res.json({ success: true, activities: [] });
            }
        }
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}