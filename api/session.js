// Simple session management without localStorage
let currentSession = null;

module.exports = (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    // Check current session
    if (currentSession) {
      return res.json({ success: true, user: currentSession });
    } else {
      return res.json({ success: false, message: 'No active session' });
    }
  }

  if (method === 'POST') {
    const { action, user } = req.body;
    
    if (action === 'login') {
      // Set session
      currentSession = user;
      return res.json({ success: true, message: 'Session created' });
    }
    
    if (action === 'logout') {
      // Clear session
      currentSession = null;
      return res.json({ success: true, message: 'Session cleared' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};