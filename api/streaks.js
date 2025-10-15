import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
    const { method, query } = req;
    const { userId } = query;

    // Handle GET request for fetching streak data
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
            console.log('🔥 Streaks - Loading data for user:', actualUserId);
            const result = await pool.query(
                'SELECT * FROM user_streaks WHERE user_id = $1',
                [actualUserId]
            );
            
            if (result.rows.length === 0) {
                // Create initial streak record
                await pool.query(
                    'INSERT INTO user_streaks (user_id, current_streak, longest_streak) VALUES ($1, 0, 0)',
                    [actualUserId]
                );
                return res.json({ success: true, streak: { current_streak: 0, longest_streak: 0 } });
            }
            
            console.log('🔥 Streaks - Found streak data:', result.rows[0]);
            return res.json({ success: true, streak: result.rows[0] });
        } catch (err) {
            console.error('❌ Streak load error:', err);
            return res.json({ success: true, streak: { current_streak: 0, longest_streak: 0 } });
        }
    }

    // Handle POST request for updating streak data
    if (method === 'POST') {
        let { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID required' });
        }

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
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            // Strict deadline check: must complete before 11:59 PM (23:59)
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const isBeforeDeadline = currentHour < 23 || (currentHour === 23 && currentMinute <= 59);
            
            if (!isBeforeDeadline) {
                return res.status(400).json({ 
                    error: 'Assessment must be completed before 11:59 PM to count for streak',
                    deadline_passed: true,
                    current_time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
                });
            }
            
            let streakResult = await pool.query(
                'SELECT * FROM user_streaks WHERE user_id = $1',
                [userId]
            );

            if (streakResult.rows.length === 0) {
                await pool.query(
                    'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_assessment_date) VALUES ($1, 1, 1, $2)',
                    [userId, today]
                );
                return res.json({ success: true, streak: { current_streak: 1, longest_streak: 1 } });
            }

            const streak = streakResult.rows[0];
            const lastDate = streak.last_assessment_date;
            
            let newStreak = 1;
            if (lastDate) {
                const lastDateObj = new Date(lastDate);
                const todayObj = new Date(today);
                const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    // Same day assessment - don't increment but return current streak
                    return res.json({ success: true, streak, same_day: true });
                } else if (diffDays === 1) {
                    // Consecutive day - increment streak
                    newStreak = streak.current_streak + 1;
                } else {
                    // Gap in days - reset to 1
                    newStreak = 1;
                }
            }

            const newLongestStreak = Math.max(streak.longest_streak, newStreak);
            
            await pool.query(
                'UPDATE user_streaks SET current_streak = $1, longest_streak = $2, last_assessment_date = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
                [newStreak, newLongestStreak, today, userId]
            );

            return res.json({ success: true, streak: { current_streak: newStreak, longest_streak: newLongestStreak } });
        } catch (err) {
            console.error('❌ Streak update error:', err);
            return res.status(500).json({ success: false, error: 'Failed to update streak: ' + err.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}