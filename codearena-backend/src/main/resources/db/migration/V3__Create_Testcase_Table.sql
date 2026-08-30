CREATE TABLE test_cases (

    id BIGSERIAL PRIMARY KEY,

    problem_id BIGINT NOT NULL,

    input TEXT NOT NULL,

    expected_output TEXT NOT NULL,

    hidden BOOLEAN NOT NULL DEFAULT FALSE,

    time_limit_ms INTEGER NOT NULL DEFAULT 5000,

    CONSTRAINT fk_test_case_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE

);