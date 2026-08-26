const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Protect routes - verify user is logged in
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (excluding password)
      const [rows] = await db.query(
        'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Restrict access to admin role only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden, admin access only' });
  }
};

module.exports = { protect, adminOnly };
