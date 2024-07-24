const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyJWT = require('../middleware/verifyJWT');
const User = require('../models/user');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.create({ username, password });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: 'Error registering user', details: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && await user.matchPassword(password)) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Error logging in', details: error.message });
    }
});

router.get('/api_key', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({api_key : user.apiKey});
    } catch (error) {
        res.status(400).json({ error: 'Error fetching API key', details: error.message });
    }
});

router.get('/session', verifyJWT, async (req, res) => {
    res.status(200).json({ message: 'Session is valid' });
});

module.exports = router;
