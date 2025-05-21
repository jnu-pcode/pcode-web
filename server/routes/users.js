const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, gold FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Update user position
router.post('/position', auth, async (req, res) => {
  try {
    const { x, y } = req.body;

    await pool.query(
      'UPDATE users SET last_position_x = $1, last_position_y = $2 WHERE id = $3',
      [x, y, req.user.id]
    );

    res.json({ message: 'Position updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's collection
router.get('/collection', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM collections WHERE user_id = $1',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to collection
router.post('/collection', auth, async (req, res) => {
  try {
    const { item_type, item_id, pos_x, pos_y } = req.body;

    const result = await pool.query(
      'INSERT INTO collections (user_id, item_type, item_id, pos_x, pos_y) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, item_type, item_id, pos_x, pos_y]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collection item position
router.put('/collection/:id', auth, async (req, res) => {
  try {
    const { pos_x, pos_y } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE collections SET pos_x = $1, pos_y = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [pos_x, pos_y, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's HTML page
router.get('/page', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT html_content FROM user_pages WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT 1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ html_content: '' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload user's HTML page
router.post('/page', auth, async (req, res) => {
  try {
    const { html_content } = req.body;

    const result = await pool.query(
      'INSERT INTO user_pages (user_id, html_content) VALUES ($1, $2) RETURNING *',
      [req.user.id, html_content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's gold
router.post('/gold', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const result = await pool.query(
      'UPDATE users SET gold = gold + $1 WHERE id = $2 RETURNING gold',
      [amount, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update house theme
router.post('/house-theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;

    const result = await pool.query(
      'UPDATE users SET house_theme = $1 WHERE id = $2 RETURNING house_theme',
      [theme, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 사용자 통계 조회
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const solvedResult = await pool.query(
      'SELECT COUNT(*) FROM problem_solutions WHERE user_id = $1',
      [userId]
    );
    const userResult = await pool.query(
      'SELECT points FROM users WHERE id = $1',
      [userId]
    );
    res.json({
      stats: {
        solvedProblems: parseInt(solvedResult.rows[0].count, 10),
        totalPoints: userResult.rows[0]?.points || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 가져오기
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 사용자 정보와 해결한 문제 수, 포인트 조회
        const result = await pool.query(
            `SELECT 
                u.id, u.username, u.points,
                COUNT(ps.id) as solved_problems
            FROM users u
            LEFT JOIN problem_solutions ps ON u.id = ps.user_id
            WHERE u.id = $1
            GROUP BY u.id`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router; 