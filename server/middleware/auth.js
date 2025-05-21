const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - Invalid auth header format');
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Auth middleware - Token:', token);
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded token:', decoded);
    
    // Get user from database
    const result = await db.query(
      'SELECT id, username, nickname, is_member FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      console.log('Auth middleware - User not found');
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    req.user = result.rows[0];
    req.token = token;
    console.log('Auth middleware - Authentication successful');
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = auth; 