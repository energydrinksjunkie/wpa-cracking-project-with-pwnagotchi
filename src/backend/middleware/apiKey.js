const User = require('../models/user');

const verifyApiKey = async (req, res, next) => {
    const apiKey = req.headers['api_key'];
    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
    }

    try {
        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying API key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = verifyApiKey;
