// Simple in-memory user storage (for demo - use database in production)
let users = [];

export default async function handler(req, res) {
    const { method } = req;
    
    if (method === 'POST' && req.url?.includes('register')) {
        const { name, email, password, dob } = req.body || {};
        
        if (!name || !email || !password || !dob) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password, // In production, hash this
            dob,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        console.log('User registered:', email);
        
        return res.json({ success: true, message: 'Account created successfully' });
    }

    if (method === 'POST' && req.url?.includes('login')) {
        const { email, password } = req.body || {};
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        // Admin login
        if (email === 'admin@chetana.com' && password === 'admin123') {
            return res.json({
                success: true,
                isAdmin: true,
                token: 'admin-token',
                user: { id: 1, name: 'Admin', email: 'admin@chetana.com', isAdmin: true }
            });
        }

        // Find registered user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            return res.json({
                success: true,
                token: `token-${user.id}`,
                user: { id: user.id, name: user.name, email: user.email }
            });
        }

        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (method === 'GET' && req.url?.includes('admin')) {
        return res.json({ 
            success: true, 
            users: users.filter(u => !u.isAdmin),
            totalAssessments: 0 
        });
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}