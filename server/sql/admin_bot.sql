-- 문제 제출 내역 테이블 (관리자 봇용)
CREATE TABLE IF NOT EXISTS problem_submissions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    user_id INTEGER REFERENCES users(id),
    answer TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    checked BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 