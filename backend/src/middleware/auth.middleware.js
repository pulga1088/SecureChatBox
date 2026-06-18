import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify local JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to request context
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User session invalid (user not found)',
        });
      }

      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed (token invalid)',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed (no token provided)',
    });
  }
};
