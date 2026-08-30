CREATE TABLE leaderboard_entries (

    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    problems_solved INTEGER NOT NULL DEFAULT 0,

    total_score INTEGER NOT NULL DEFAULT 0,

    acceptance_rate DOUBLE PRECISION NOT NULL DEFAULT 0,

    fastest_submission_time_ms BIGINT,

    CONSTRAINT fk_leaderboard_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);