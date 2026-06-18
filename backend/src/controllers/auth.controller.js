import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const normalizePhone = (phone) => {
  if (!phone) return phone;
  // Strip all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    cleaned = '+91' + cleaned;
  }
  return cleaned;
};

/**
 * Verifies a client's Firebase ID Token, logs/registers the user in MongoDB,
 * and signs a backend JWT token for all future API/socket calls.
 */
export const verifyFirebaseToken = async (req, res) => {
  const { idToken, name, phone, location } = req.body;

  if (!idToken) {
    return res.status(400).json({
      status: 'error',
      message: 'idToken parameter is required',
    });
  }

  try {
    const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyDoUafdDyp8cU4Ck9R2X1l_wWNEISxejPA'; // Defaults to user project API key
    
    // 1. Verify token validity by calling Google accounts lookup REST endpoint
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Firebase token verification rejected';
      return res.status(400).json({
        status: 'error',
        message: errMsg,
      });
    }

    const firebaseUser = data.users?.[0];
    if (!firebaseUser) {
      return res.status(400).json({
        status: 'error',
        message: 'No matching user found in Firebase system',
      });
    }

    const { phoneNumber, email } = firebaseUser;

    if (!phoneNumber && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Firebase user does not contain a phone number or email',
      });
    }

    const normalizedPhoneNumber = phoneNumber ? normalizePhone(phoneNumber) : undefined;
    const normalizedPhoneInput = phone ? normalizePhone(phone) : undefined;
    const normalizedEmail = email ? email.toLowerCase() : undefined;

    // 2. Query DB to find existing user or register a new user
    let user;
    if (normalizedPhoneNumber) {
      user = await User.findOne({ phone: normalizedPhoneNumber });
    }
    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }
    if (!user && normalizedPhoneInput) {
      user = await User.findOne({ phone: normalizedPhoneInput });
    }

    if (!user) {
      let defaultName = 'User';
      if (normalizedEmail) {
        defaultName = normalizedEmail.split('@')[0];
      } else if (normalizedPhoneNumber) {
        defaultName = `User_${normalizedPhoneNumber.slice(-4)}`;
      } else if (normalizedPhoneInput) {
        defaultName = `User_${normalizedPhoneInput.slice(-4)}`;
      }

      user = await User.create({
        name: name || defaultName,
        phone: normalizedPhoneInput || normalizedPhoneNumber || undefined,
        email: normalizedEmail || undefined,
        location: location || undefined,
        status: 'Hey there! I am using Secure Chat.',
      });
    } else {
      // If user exists but is missing phone, email, or location, update it
      let updateNeeded = false;
      if (normalizedPhoneNumber && !user.phone) {
        user.phone = normalizedPhoneNumber;
        updateNeeded = true;
      }
      if (normalizedPhoneInput && !user.phone) {
        user.phone = normalizedPhoneInput;
        updateNeeded = true;
      }
      if (normalizedEmail && !user.email) {
        user.email = normalizedEmail;
        updateNeeded = true;
      }
      if (location && !user.location) {
        user.location = location;
        updateNeeded = true;
      }
      if (updateNeeded) {
        await user.save();
      }
    }

    // 3. Issue and sign a secure backend JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: user.location,
        profileImage: user.profileImage,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Auth verify-token handler crash:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error verifying authentication token',
    });
  }
};

/**
 * Fetches the logged-in user profile.
 */
export const getProfile = async (req, res) => {
  return res.json({
    status: 'success',
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      location: req.user.location,
      profileImage: req.user.profileImage,
      status: req.user.status,
    },
  });
};
