const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 모든 문제 목록 조회
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, category, difficulty, points, hint, hint_cost, html_path, created_at
             FROM problems
             ORDER BY category, difficulty, points`
        );
        const problems = result.rows;
        // 각 문제별로 내가 풀었는지 확인
        const solvedResult = await pool.query(
            'SELECT problem_id FROM problem_solutions WHERE user_id = $1',
            [req.user.id]
        );
        const solvedSet = new Set(solvedResult.rows.map(row => row.problem_id));
        const problemsWithSolved = problems.map(problem => ({
            ...problem,
            solved: solvedSet.has(problem.id)
        }));
        res.json({ problems: problemsWithSolved, totalProblems: problemsWithSolved.length });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 카테고리별 문제 조회
router.get('/category/:category', auth, async (req, res) => {
    try {
        const { category } = req.params;
        const result = await pool.query(
            'SELECT id, title, difficulty, points, hint, hint_cost, html_path, created_at FROM problems WHERE category = $1',
            [category]
        );
        res.json({ problems: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 문제 상세 조회 (숫자 id만)
router.get('/:id(\\d+)', auth, async (req, res) => {
    try {
        const { id } = req.params;
        // 문제 정보 조회
        const result = await pool.query(
            `SELECT id, title, difficulty, points, hint, hint_cost, html_path, created_at
             FROM problems WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
        }
        const problem = result.rows[0];

        // 내가 풀었는지 확인
        const solvedResult = await pool.query(
            'SELECT 1 FROM problem_solutions WHERE user_id = $1 AND problem_id = $2',
            [req.user.id, id]
        );
        const solved = solvedResult.rows.length > 0;

        res.json({ ...problem, solved });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// Create new problem
router.post('/', auth, async (req, res) => {
  try {
    const { category, title, difficulty, points, hint, hint_cost, html_path } = req.body;

    const result = await pool.query(
      'INSERT INTO problems (user_id, category, title, difficulty, points, hint, hint_cost, html_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.id, category, title, difficulty, points, hint, hint_cost, html_path]
    );

    // Award gold for creating a problem
    await pool.query(
      'UPDATE users SET gold = gold + $1 WHERE id = $2',
      [500, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 문제 풀이 제출
router.post('/:id/submit', auth, async (req, res) => {
    const { id } = req.params;
    const { flag } = req.body;
    const userId = req.user.id;

    try {
        // 플래그 형식 검증
        if (!flag || typeof flag !== 'string') {
            return res.status(400).json({ error: '플래그를 입력해주세요.' });
        }

        // 문제 정보 조회
        const problemResult = await pool.query(
            'SELECT id, points, flag, title FROM problems WHERE id = $1',
            [id]
        );

        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
        }

        const problem = problemResult.rows[0];
        
        // 정답 비교 (앞뒤 공백만 제거하고 대소문자는 구분)
        const normalizedUserFlag = flag.trim();
        const normalizedAnswer = problem.flag.trim();
        console.log('제출된 플래그:', normalizedUserFlag);
        console.log('정답 플래그:', normalizedAnswer);
        console.log('문제 제목:', problem.title);
        const isCorrect = normalizedUserFlag === normalizedAnswer;
        console.log('정답 여부:', isCorrect);

        if (isCorrect) {
            // 이미 해결한 문제인지 확인
            const solvedResult = await pool.query(
                'SELECT * FROM problem_solutions WHERE user_id = $1 AND problem_id = $2',
                [userId, id]
            );

            if (solvedResult.rows.length === 0) {
                // 해결 기록 추가
                await pool.query(
                    'INSERT INTO problem_solutions (user_id, problem_id) VALUES ($1, $2)',
                    [userId, id]
                );

                // 포인트 추가
                await pool.query(
                    'UPDATE users SET points = points + $1 WHERE id = $2',
                    [problem.points, userId]
                );
                res.json({ correct: true, message: '축하합니다! 문제를 해결했습니다!' });
            } else {
                res.json({ correct: true, message: '정답입니다! (이미 해결한 문제입니다)' });
            }
        } else {
            res.json({ correct: false, message: '틀렸습니다. 다시 시도해보세요.' });
        }
    } catch (error) {
        console.error('플래그 제출 에러:', error);
        res.status(500).json({ error: '서버 에러가 발생했습니다.' });
    }
});

// Get user's problem submissions
router.get('/submissions', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ps.*, p.title, p.category FROM problem_submissions ps JOIN problems p ON ps.problem_id = p.id WHERE ps.user_id = $1 ORDER BY ps.submitted_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to verify problem answers
function verifyAnswer(problem, answer) {
  // Implement your own verification logic based on problem type
  // This is a placeholder implementation
  switch (problem.category) {
    case 'web':
      // Verify web security challenges
      return verifyWebChallenge(problem, answer);
    case 'crypto':
      // Verify cryptography challenges
      return verifyCryptoChallenge(problem, answer);
    case 'reversing':
      // Verify reverse engineering challenges
      return verifyReversingChallenge(problem, answer);
    default:
      return false;
  }
}

// Example verification functions (implement your own logic)
function verifyWebChallenge(problem, answer) {
  // Implement web challenge verification
  return answer === problem.solution;
}

function verifyCryptoChallenge(problem, answer) {
  // Implement cryptography challenge verification
  return answer === problem.solution;
}

function verifyReversingChallenge(problem, answer) {
  // Implement reverse engineering challenge verification
  return answer === problem.solution;
}

// 힌트 정보 조회
router.get('/:id/hint', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT hint_cost FROM problems WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
        }

        res.json({ cost: result.rows[0].hint_cost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 힌트 구매
router.post('/:id/hint', auth, async (req, res) => {
    try {
        // 문제 정보 조회
        const problemResult = await pool.query(
            'SELECT * FROM problems WHERE id = $1',
            [req.params.id]
        );

        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
        }

        const problem = problemResult.rows[0];

        // 이미 힌트를 구매했는지 확인
        const hintResult = await pool.query(
            'SELECT id FROM hint_purchases WHERE user_id = $1 AND problem_id = $2',
            [req.user.id, req.params.id]
        );

        if (hintResult.rows.length > 0) {
            return res.status(400).json({ error: '이미 힌트를 구매했습니다.' });
        }

        // 사용자 점수 확인
        const userResult = await pool.query(
            'SELECT points FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows[0].points < problem.hint_cost) {
            return res.status(400).json({ error: '점수가 부족합니다.' });
        }

        // 힌트 구매 처리
        await pool.query('BEGIN');

        // 힌트 구매 기록 추가
        await pool.query(
            'INSERT INTO hint_purchases (user_id, problem_id) VALUES ($1, $2)',
            [req.user.id, req.params.id]
        );

        // 사용자 점수 차감
        await pool.query(
            'UPDATE users SET points = points - $1 WHERE id = $2',
            [problem.hint_cost, req.user.id]
        );

        await pool.query('COMMIT');

        res.json({ message: '힌트가 구매되었습니다.' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 정답 처리 API (관리자 봇이 호출)
router.post('/mark-correct', async (req, res) => {
  const { user_id, problem_id } = req.body;
  try {
    // 이미 정답 처리된 경우 중복 방지
    const solved = await pool.query(
      'SELECT id FROM problem_solutions WHERE user_id = $1 AND problem_id = $2',
      [user_id, problem_id]
    );
    if (solved.rows.length === 0) {
      await pool.query(
        'INSERT INTO problem_solutions (user_id, problem_id) VALUES ($1, $2)',
        [user_id, problem_id]
      );
      // 점수 부여 등 추가 가능
    }
    res.json({ message: '정답 처리 완료' });
  } catch (error) {
    res.status(500).json({ message: '정답 처리 중 오류가 발생했습니다.' });
  }
});

// 문제 업데이트
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, difficulty, points, hint, hint_cost, html_path } = req.body;

        // 문제 존재 여부 확인
        const problemResult = await pool.query(
            'SELECT * FROM problems WHERE id = $1',
            [id]
        );

        if (problemResult.rows.length === 0) {
            return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
        }

        // 문제 업데이트
        const result = await pool.query(
            `UPDATE problems 
             SET title = $1, difficulty = $2, points = $3, hint = $4, hint_cost = $5, html_path = $6
             WHERE id = $7
             RETURNING *`,
            [title, difficulty, points, hint, hint_cost, html_path, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating problem:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router; 