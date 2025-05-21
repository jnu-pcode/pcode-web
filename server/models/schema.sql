-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gold INTEGER DEFAULT 0,
    last_position_x INTEGER DEFAULT 100,
    last_position_y INTEGER DEFAULT 100,
    house_theme VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    reward INTEGER NOT NULL,
    html_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collections table
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_type VARCHAR(50) NOT NULL,
    item_id INTEGER NOT NULL,
    pos_x INTEGER,
    pos_y INTEGER,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User pages table
CREATE TABLE user_pages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    html_content TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Board posts table
CREATE TABLE board_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problem submissions table
CREATE TABLE problem_submissions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    user_id INTEGER REFERENCES users(id),
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cyber disaster events table
CREATE TABLE cyber_disasters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles in cyber disasters
CREATE TABLE disaster_roles (
    id SERIAL PRIMARY KEY,
    disaster_id INTEGER REFERENCES cyber_disasters(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('gardy', 'glitch')),
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_board_posts_user_id ON board_posts(user_id);
CREATE INDEX idx_problem_submissions_user_id ON problem_submissions(user_id);
CREATE INDEX idx_disaster_roles_user_id ON disaster_roles(user_id); 