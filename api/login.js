export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: password ? '***' : 'missing' });

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
    console.log('User found:', !!user);
    
    if (user) {
        return res.json({
            success: true,
            token: 'demo-token',
            user: { id: 2, name: user.name, email: user.email }
        });
    }

    console.log('Available accounts:', demoAccounts.map(u => u.email));
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
}