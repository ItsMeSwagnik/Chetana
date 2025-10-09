import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    const { method } = req;
    
    if (method === 'POST' && req.url?.includes('register')) {
        const { name, email, password, dob } = req.body || {};
        
        if (!name || !email || !password || !dob) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        try {
            // Check if user already exists
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ success: false, error: 'Email already registered' });
            }

            // Create new user
            const result = await pool.query(
                'INSERT INTO users (name, email, password, dob, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email',
                [name, email, password, dob]
            );
            
            console.log('User registered:', email);
            return res.json({ success: true, message: 'Account created successfully' });
        } catch (err) {
            console.error('Registration error:', err);
            return res.status(500).json({ success: false, error: 'Registration failed' });
        }
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

        try {
            // Find registered user in database
            const result = await pool.query(
                'SELECT id, name, email FROM users WHERE email = $1 AND password = $2',
                [email, password]
            );
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                return res.json({
                    success: true,
                    token: `token-${user.id}`,
                    user: { id: user.id, name: user.name, email: user.email }
                });
            }

            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        } catch (err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, error: 'Login failed' });
        }
    }

    if (method === 'GET' && req.url?.includes('admin')) {
        try {
            const result = await pool.query('SELECT id, name, email, dob, created_at FROM users ORDER BY created_at DESC');
            return res.json({ 
                success: true, 
                users: result.rows,
                totalAssessments: 0 
            });
        } catch (err) {
            console.error('Admin query error:', err);
            return res.json({ success: true, users: [], totalAssessments: 0 });
        }
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}