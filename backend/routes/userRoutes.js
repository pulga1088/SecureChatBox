const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all users (to populate the New Chat list)
// @route   GET /api/users
router.get('/', async (req, res) => {
    try {
        // Find all users and return their ID, name, phone, and publicKey
        const users = await User.find().select('_id name phone publicKey');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching users' });
    }
});

module.exports = router;
