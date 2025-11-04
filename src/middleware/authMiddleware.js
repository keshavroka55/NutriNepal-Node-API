const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');

const authenticateUser = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    // console.log('Decoded JWT:', decoded); 

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // ✅ This line makes req.user available to your controllers
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { authenticateUser };
