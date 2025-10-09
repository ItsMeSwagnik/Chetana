import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
    const { method, query } = req;
    const action = query.action;
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Parse JSON body if needed
    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.error('Failed to parse JSON body:', e);
        }
    }
    
    // Debug log for POST requests
    if (method === 'POST') {
        console.log('POST request:', { action, hasBody: !!body, bodyKeys: body ? Object.keys(body) : [] });
    }
    
    if (method === 'POST' && (action === 'login' || req.url?.includes('login'))) {
        const { email, password } = body || {};
        console.log('Login credentials:', { email, passwordLength: password?.length });
        
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

        // Fallback test users (check first for demo purposes)
        const testUsers = {
            'demo@chetana.com': { id: 1, name: 'Demo User', password: 'demo123' },
            'test@test.com': { id: 2, name: 'Test User', password: '123456' },
            'user@example.com': { id: 3, name: 'John Doe', password: 'password' },
            'swagnikganguly2004@gmail.com': { id: 4, name: 'Swagnik', password: 'swagnik' }
        };
        
        const testUser = testUsers[email];
        if (testUser && testUser.password === password) {
            return res.json({
                success: true,
                token: `token-${testUser.id}`,
                user: { id: testUser.id, name: testUser.name, email: email },
                offline: true
            });
        }

        try {
            console.log('DB URL exists:', !!process.env.DATABASE_URL);
            
            const result = await pool.query(
                'SELECT id, name, email FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) AND TRIM(password) = TRIM($2)',
                [email, password]
            );
            
            console.log('Query executed. Rows found:', result.rows.length);
            
            // Debug: Check if user exists with just email
            const emailCheck = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
            console.log('User exists with email:', emailCheck.rows.length > 0);
            
            if (emailCheck.rows.length > 0) {
                // Check password field
                const passCheck = await pool.query('SELECT password FROM users WHERE email = $1', [email]);
                console.log('Stored password length:', passCheck.rows[0]?.password?.length);
            }
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                console.log('User authenticated successfully');
                return res.json({
                    success: true,
                    token: `token-${user.id}`,
                    user: { id: user.id, name: user.name, email: user.email }
                });
            }
        } catch (err) {
            console.error('Database error details:', {
                message: err.message,
                code: err.code,
                detail: err.detail
            });
        }
        
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (method === 'POST' && (action === 'register' || req.url?.includes('register'))) {
        const { name, email, password, dob } = body || {};
        
        if (!name || !email || !password || !dob) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        try {
            await pool.query(
                'INSERT INTO users (name, email, password, dob, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [name, email, password, dob]
            );
            return res.json({ success: true, message: 'Account created successfully' });
        } catch (err) {
            if (err.code === '23505') {
                return res.status(400).json({ success: false, error: 'Email already registered' });
            }
            return res.status(500).json({ success: false, error: 'Registration failed' });
        }
    }

    if (method === 'GET' && (action === 'admin' || req.url?.includes('admin'))) {
        try {
            const result = await pool.query('SELECT id, name, email, dob, created_at FROM users ORDER BY created_at DESC');
            return res.json({ success: true, users: result.rows, totalAssessments: 0 });
        } catch (err) {
            return res.json({ success: true, users: [], totalAssessments: 0 });
        }
    }

    // Debug endpoint
    if (method === 'GET' && action === 'test') {
        return res.json({ success: true, message: 'API is working', action, method, url: req.url });
    }
    
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}