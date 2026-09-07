-- TikTok Live Monitor database schema

CREATE TABLE IF NOT EXISTS live_streams (
    id SERIAL PRIMARY KEY,
    host_username VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    viewer_count INTEGER DEFAULT 0
);
