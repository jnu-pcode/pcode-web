const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 사용자 프로필 정보 조회
router.get('/profile', auth, async (req, res) => {
    try {
        // 사용자 정보와 해결한 문제 수, 포인트를 함께 조회
        const result = await pool.query(
            `SELECT 
                u.id, u.username, u.nickname, u.is_member,
                COALESCE(u.points, 0) as points,
                COUNT(ps.id) as solved_problems
            FROM users u
            LEFT JOIN problem_solutions ps ON u.id = ps.user_id
            WHERE u.id = $1
            GROUP BY u.id`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 사용자의 아이템 목록 조회
router.get('/items', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            `SELECT i.id, i.name, i.icon, i.description, i.type, i.rarity,
                    ui.acquired_at
             FROM items i
             INNER JOIN user_items ui ON i.id = ui.item_id
             WHERE ui.user_id = $1
             ORDER BY ui.acquired_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 아이템 획득
router.post('/items/:itemId', auth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;
        const itemId = req.params.itemId;

        // 아이템 정보 조회
        const itemResult = await client.query(
            'SELECT points_cost FROM items WHERE id = $1',
            [itemId]
        );

        if (itemResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
        }

        const itemCost = itemResult.rows[0].points_cost;

        // 사용자 포인트 확인
        const userStatsResult = await client.query(
            'SELECT points FROM user_stats WHERE user_id = $1',
            [userId]
        );

        if (userStatsResult.rows[0].points < itemCost) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: '포인트가 부족합니다.' });
        }

        // 아이템 획득 처리
        await client.query(
            'INSERT INTO user_items (user_id, item_id) VALUES ($1, $2)',
            [userId, itemId]
        );

        // 포인트 차감 및 통계 업데이트
        await client.query(
            `UPDATE user_stats 
             SET points = points - $1,
                 collected_items = collected_items + 1
             WHERE user_id = $2`,
            [itemCost, userId]
        );

        await client.query('COMMIT');
        res.json({ message: '아이템을 획득했습니다.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error acquiring item:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    } finally {
        client.release();
    }
});

module.exports = router; 