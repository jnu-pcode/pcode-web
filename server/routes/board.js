const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

console.log('board router loaded');
// 게시글 목록 조회
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // 전체 게시글 수 조회
        const countResult = await pool.query(
            `SELECT COUNT(*) 
             FROM board_posts 
             WHERE title ILIKE $1 OR content ILIKE $1`,
            [`%${search}%`]
        );
        const totalPosts = parseInt(countResult.rows[0].count);

        // 게시글 목록 조회
        const result = await pool.query(
            `SELECT bp.id, bp.title, bp.created_at, 
                    u.username, u.nickname,
                    (SELECT COUNT(*) FROM board_comments WHERE post_id = bp.id) as comment_count
             FROM board_posts bp
             JOIN users u ON bp.user_id = u.id
             WHERE bp.title ILIKE $1 OR bp.content ILIKE $1
             ORDER BY bp.created_at DESC
             LIMIT $2 OFFSET $3`,
            [`%${search}%`, limit, offset]
        );

        res.json({
            posts: result.rows,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        // 게시글 정보 조회
        const postResult = await pool.query(
            `SELECT bp.*, u.username, u.nickname
             FROM board_posts bp
             JOIN users u ON bp.user_id = u.id
             WHERE bp.id = $1`,
            [postId]
        );

        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 조회수 증가
        await pool.query(
            'UPDATE board_posts SET views = views + 1 WHERE id = $1',
            [postId]
        );

        // 댓글 목록 조회
        const commentsResult = await pool.query(
            `SELECT bc.*, u.username, u.nickname
             FROM board_comments bc
             JOIN users u ON bc.user_id = u.id
             WHERE bc.post_id = $1
             ORDER BY bc.created_at ASC`,
            [postId]
        );

        res.json({
            post: postResult.rows[0],
            comments: commentsResult.rows
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 작성
router.post('/', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            `INSERT INTO board_posts (user_id, title, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, title, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 수정
router.put('/:id', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content } = req.body;
        const userId = req.user.id;

        // 게시글 작성자 확인
        const postResult = await pool.query(
            'SELECT user_id FROM board_posts WHERE id = $1',
            [postId]
        );

        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (postResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
        }

        const result = await pool.query(
            `UPDATE board_posts 
             SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [title, content, postId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 게시글 삭제
router.delete('/:id', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        // 게시글 작성자 확인
        const postResult = await pool.query(
            'SELECT user_id FROM board_posts WHERE id = $1',
            [postId]
        );

        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (postResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });
        }

        // 댓글 먼저 삭제
        await pool.query('DELETE FROM board_comments WHERE post_id = $1', [postId]);
        
        // 게시글 삭제
        await pool.query('DELETE FROM board_posts WHERE id = $1', [postId]);

        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 댓글 작성
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            `INSERT INTO board_comments (post_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [postId, userId, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 댓글 삭제
router.delete('/comments/:id', auth, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        // 댓글 작성자 확인
        const commentResult = await pool.query(
            'SELECT user_id FROM board_comments WHERE id = $1',
            [commentId]
        );

        if (commentResult.rows.length === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (commentResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
        }

        await pool.query('DELETE FROM board_comments WHERE id = $1', [commentId]);

        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router; 