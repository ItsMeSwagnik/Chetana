export default async function handler(req, res) {
    const { method, query } = req;
    const { type } = query;

    // Handle different data types
    if (type === 'register' && method === 'POST') {
        const { name, email, password, dob } = req.body;
        if (!name || !email || !password || !dob) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        return res.json({ success: true, message: 'Account created successfully' });
    }

    if (type === 'assessments') {
        if (method === 'POST') {
            return res.json({ success: true, message: 'Assessment saved' });
        }
        if (method === 'GET') {
            return res.json({ success: true, assessments: [] });
        }
    }

    if (type === 'moods') {
        if (method === 'POST') {
            return res.json({ success: true, message: 'Mood saved' });
        }
        if (method === 'GET') {
            return res.json({ success: true, moods: [] });
        }
    }

    if (type === 'milestones') {
        if (method === 'POST') {
            return res.json({ success: true, message: 'Milestone saved' });
        }
        if (method === 'GET') {
            return res.json({ success: true, milestones: [] });
        }
    }

    if (type === 'admin-users' && method === 'GET') {
        return res.json({ 
            success: true, 
            users: [], 
            totalAssessments: 0 
        });
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}