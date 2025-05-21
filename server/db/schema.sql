-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    points INTEGER DEFAULT 0,
    solved_problems INTEGER DEFAULT 0,
    collected_items INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    points_cost INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Items relationship table
CREATE TABLE IF NOT EXISTS user_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_id INTEGER REFERENCES items(id),
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- Default items data
INSERT INTO items (name, icon, description, type, rarity, points_cost) VALUES
    ('Security Guide', 'book', 'Basic security guidebook', 'book', 'common', 0),
    ('Hacking Tools', 'tool', 'Basic hacking tool set', 'tool', 'common', 0),
    ('Trophy', 'trophy', 'First CTF victory trophy', 'trophy', 'rare', 100);

-- Trigger function: Create user stats table automatically when user is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Create user stats table automatically when user is created
CREATE TRIGGER create_user_stats_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_stats(); 