const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate a JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register or Login User logic (mocking OTP verification for now)
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    const { phone, publicKey, name } = req.body;

    if (!phone || !publicKey) {
        return res.status(400).json({ error: 'Phone and Public Key are required' });
    }

    try {
        // Look for existing user
        let user = await User.findOne({ phone });

        if (user) {
            // Update public key in case they are logging in from a new device
            // (In a real high-security app, managing key changes requires a careful process)
            user.publicKey = publicKey;
            if (name) user.name = name;
            await user.save();
        } else {
            // Create a new user account
            user = await User.create({
                phone,
                publicKey,
                name: name || 'New User'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Authentication successful',
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                publicKey: user.publicKey,
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
};
