const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  // Simple validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role (default to 'user', unless explicitly 'admin')
    const userRole = role === 'admin' ? 'admin' : 'user';

    // Insert user into DB
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, userRole]
    );

    const newUserId = result.insertId;

    // Return response with token
    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(newUserId),
      user: {
        id: newUserId,
        first_name,
        last_name,
        email,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return response with token
    res.json({
      message: 'Login successful',
      token: generateToken(user.id),
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  // req.user is populated by protect middleware
  res.json({ user: req.user });
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
