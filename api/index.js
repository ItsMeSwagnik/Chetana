export default async function handler(req, res) {
    const { method, url } = req;
    const path = new URL(url, `http://${req.headers.host}`).pathname;

    // Login endpoint
    if (path === '/api/login' && method === 'POST') {
        const { email, password } = req.body;

        if (email === 'admin@chetana.com' && password === 'admin123') {
            return res.json({
                success: true,
                isAdmin: true,
                token: 'admin-token',
                user: { id: 1, name: 'Admin', email: 'admin@chetana.com', isAdmin: true }
            });
        }

        const demoAccounts = [
            { email: 'demo@chetana.com', password: 'demo123', name: 'Demo User' },
            { email: 'user@example.com', password: 'password', name: 'Example User' },
            { email: 'test@test.com', password: '123456', name: 'Test User' }
        ];

        const user = demoAccounts.find(u => u.email === email && u.password === password);
        
        if (user) {
            return res.json({
                success: true,
                token: 'demo-token',
                user: { id: 2, name: user.name, email: user.email }
            });
        }

        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Register endpoint
    if (path === '/api/register' && method === 'POST') {
        const { name, email, password, dob } = req.body;
        if (!name || !email || !password || !dob) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        return res.json({ success: true, message: 'Account created successfully' });
    }

    // Assessments endpoint
    if (path === '/api/assessments') {
        if (method === 'POST') {
            return res.json({ success: true, message: 'Assessment saved' });
        }
        if (method === 'GET') {
            return res.json({ success: true, assessments: [] });
        }
    }

    // Moods endpoint
    if (path === '/api/moods') {
        if (method === 'POST') {
            return res.json({ success: true, message: 'Mood saved' });
        }
        if (method === 'GET') {
            return res.json({ success: true, moods: [] });
        }
    }

    // Milestones endpoint
    if (path === '/api/milestones') {
        if (method === 'POST') {
            return res.json({ success: true, message: 'Milestone saved' });
        }
        if (method === 'GET') {
            return res.json({ success: true, milestones: [] });
        }
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}