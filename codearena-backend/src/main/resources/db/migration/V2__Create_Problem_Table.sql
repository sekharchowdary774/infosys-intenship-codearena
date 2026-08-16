CREATE TABLE problems (

    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    difficulty VARCHAR(20) NOT NULL,

    topic VARCHAR(500) NOT NULL,

    starter_code_java TEXT,

    starter_code_python TEXT,

    starter_code_cpp TEXT,

    starter_code_javascript TEXT,

    editorial TEXT,

    hints TEXT,

    editorial_unlock_attempts INTEGER DEFAULT 3,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);