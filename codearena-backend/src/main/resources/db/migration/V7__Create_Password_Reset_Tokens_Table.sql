CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,

    token VARCHAR(100) NOT NULL UNIQUE,

    user_id BIGINT NOT NULL UNIQUE,

    expiry_time TIMESTAMP NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_password_reset_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);