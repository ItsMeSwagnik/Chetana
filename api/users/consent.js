module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const { healthDataConsent, analyticsConsent, researchConsent } = req.body;
    
    console.log('Consent preferences received:', {
        healthDataConsent,
        analyticsConsent, 
        researchConsent
    });
    
    // Always return success for now
    res.json({ 
        success: true, 
        message: 'Consent preferences updated successfully',
        data: {
            healthDataConsent,
            analyticsConsent,
            researchConsent
        }
    });
};