const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
        default: 'Unknown User'
    },
    publicKey: {
        type: String,
        required: true,
        // This is crucial for Secure Chat. When Alice wants to message Bob, 
        // she fetches Bob's publicKey from the database to encrypt her message.
    },
    // We will not store simple passwords, we will go with passwordless OTP 
    // or you can add a hashed passcode field later if needed.
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);
