-- 기존 테이블 삭제
DROP TABLE IF EXISTS problem_solutions;
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS board_posts;
DROP TABLE IF EXISTS user_collections;
DROP TABLE IF EXISTS user_positions;
DROP TABLE IF EXISTS users;

-- 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    is_member BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 사용자 위치 테이블
CREATE TABLE user_positions (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    x INTEGER DEFAULT 0,
    y INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 수집품 테이블
CREATE TABLE user_collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_type VARCHAR(50) NOT NULL,
    item_id INTEGER NOT NULL,
    position_x INTEGER,
    position_y INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게시판 테이블
CREATE TABLE board_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 문제 테이블
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 문제 풀이 기록
CREATE TABLE problem_solutions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    problem_id INTEGER REFERENCES problems(id),
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
); 