const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes - requires a valid JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Like protect, but never blocks the request. If a valid Bearer token is
// present, req.user is populated (same as protect); otherwise the request
// just continues with req.user left undefined. Used by routes that serve
// both guests and logged-in users differently (e.g. the Pulse homepage
// endpoint), without forcing a login.
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Invalid/expired token - treat as a guest rather than failing the request
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
