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
    
    // Handle streak endpoints specifically
    if (req.url && req.url.includes('/api/streaks')) {
        if (method === 'GET') {
            return handleStreakGet(req, res, userId);
        }
        if (method === 'POST') {
            return handleStreakUpdate(req, res);
        }
    }
    
    async function handleStreakGet(req, res, userId) {
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
    
    async function handleStreakUpdate(req, res) {
        let { userId } = req.body;
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

    if (dataType === 'assessments') {
        if (method === 'POST') {
            const { userId, phq9, gad7, pss, responses, assessmentDate } = req.body;
            console.log('💾 Assessment POST request:', { userId, phq9, gad7, pss, assessmentDate, hasResponses: !!responses });
            try {
                const result = await pool.query(
                    'INSERT INTO assessments (user_id, phq9_score, gad7_score, pss_score, responses, assessment_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [userId, phq9, gad7, pss, JSON.stringify(responses), assessmentDate]
                );
                console.log('✅ Assessment saved with ID:', result.rows[0].id);
                return res.json({ success: true, message: 'Assessment saved', id: result.rows[0].id });
            } catch (err) {
                console.error('❌ Assessment save error:', err);
                return res.status(500).json({ success: false, error: 'Failed to save assessment: ' + err.message });
            }
        }
        if (method === 'GET' && userId) {
            try {
                console.log('📊 Assessment GET request for user:', userId);
                const result = await pool.query(
                    'SELECT * FROM assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
                    [userId]
                );
                console.log('📊 Found assessments:', result.rows.length);
                return res.json({ success: true, assessments: result.rows });
            } catch (err) {
                console.error('❌ Assessment load error:', err);
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

    if (dataType === 'streaks') {
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
        
        if (method === 'POST') {
            let { userId } = req.body;
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
    }

    if (dataType === 'admin-stats') {
        if (method === 'GET') {
            try {
                console.log('📊 Admin Stats - Loading data');
                
                // Get total users (excluding admin)
                const usersResult = await pool.query(
                    'SELECT COUNT(*) as total FROM users WHERE (isadmin IS NULL OR isadmin = false)'
                );
                
                // Get total assessments
                const assessmentsResult = await pool.query(
                    'SELECT COUNT(*) as total FROM assessments'
                );
                
                const totalUsers = parseInt(usersResult.rows[0].total) || 0;
                const totalAssessments = parseInt(assessmentsResult.rows[0].total) || 0;
                
                console.log('📊 Admin Stats - Users:', totalUsers, 'Assessments:', totalAssessments);
                
                return res.json({ 
                    success: true, 
                    stats: {
                        totalUsers,
                        totalAssessments
                    }
                });
            } catch (err) {
                console.error('❌ Admin stats error:', err);
                return res.status(500).json({ success: false, error: 'Failed to load admin stats: ' + err.message });
            }
        }
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}