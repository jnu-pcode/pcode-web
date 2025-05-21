const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 회원가입
router.post('/register', async (req, res) => {
  const { username, password, nickname, code } = req.body;

  try {
    // 사용자 이름 중복 확인
    const userCheck = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    // 닉네임 중복 확인
    const nicknameCheck = await db.query(
      'SELECT * FROM users WHERE nickname = $1',
      [nickname]
    );

    if (nicknameCheck.rows.length > 0) {
      return res.status(400).json({ message: '이미 사용 중인 닉네임입니다.' });
    }

    // 비밀번호 해시화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 인증 코드 확인
    let isMember = false;
    if (code) {
      // TODO: 실제 인증 코드 검증 로직 구현
      isMember = code === 'PCODE2025';
    }

    // 사용자 생성
    const result = await db.query(
      `INSERT INTO users (username, password, nickname, is_member, created_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING id, username, nickname, is_member`,
      [username, hashedPassword, nickname, isMember]
    );

    res.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username });

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    console.log('Database query result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const user = result.rows[0];
    console.log('Found user:', { 
      id: user.id, 
      username: user.username,
      storedPassword: user.password // 해시된 비밀번호
    });
    
    // 비밀번호 비교 전 로그
    console.log('Attempting to compare passwords...');
    console.log('Input password:', password);
    console.log('Stored hash:', user.password);
    
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname, isMember: user.is_member },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isMember: user.is_member
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
  }
});

// 토큰 검증
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보 조회
    const result = await db.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    res.json({
      valid: true,
      user: result.rows[0]
    });
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
});

module.exports = router; 