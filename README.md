<<<<<<< HEAD
# CodeArena

A full-stack coding practice and performance assessment platform built with **Spring Boot**, **React**, and **PostgreSQL**. The platform enables users to solve coding problems, submit solutions, track performance, and view leaderboards through a secure and scalable architecture.

## 🚀 Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- PostgreSQL
- Flyway

### Frontend
- React
- React Router
- Axios

### Tools
- Git & GitHub
- Postman
- Docker (Planned)
- Monaco Editor (Planned)

---

## 📂 Project Structure

```text
codearena/
│
├── backend/
│   └── Spring Boot Application
│
├── frontend/
│   └── React Application
│
└── README.md
```

---

## ✨ Planned Features

- User Registration & Login
- JWT Authentication
- Coding Problems
- Online Code Editor
- Code Submission
- Test Case Evaluation
- Leaderboard
- User Profile
- Admin Dashboard
- Docker-based Code Execution

---

## 📌 Project Status

🚧 Currently under development.

This project is being developed as part of the **Infosys Springboard Virtual Internship 7.0** while following enterprise-level software engineering practices.

---

=======
# CodeArena — Online Coding Practice Platform

A full-stack coding practice platform developed as part of the **Infosys Springboard Virtual Internship**.

## Project Overview

CodeArena is a web-based coding practice platform where users can discover programming problems, write code, execute solutions, submit answers, receive automated evaluation results, and track their progress.

**Workflow:** Choose a Problem → Write Code → Run/Test → Submit → Get Results → Track Progress

## Objectives

- Provide a centralized coding practice platform
- Organize problems by topic and difficulty
- Provide an online coding editor using Monaco Editor
- Execute code inside an isolated Docker environment
- Evaluate submissions against predefined test cases
- Maintain submission history and performance statistics
- Provide dashboards, leaderboards, and study plans
- Provide administrative tools for platform management

## Key Features

### User Features
- Registration and login
- JWT-based authentication
- Problem bank with search and filtering
- Problem descriptions, examples, constraints, hints, and editorials
- Monaco Editor with syntax highlighting
- Code execution and submission evaluation
- Submission history with execution time and memory statistics
- User dashboard and progress tracking
- Language statistics and submission activity heatmap
- Global leaderboard
- Study plans
- Profile management

### Admin Features
- Role-based admin access
- Problem creation, editing, and deletion
- Test case management
- User management (role changes, ban/unban)
- Submission monitoring
- Leaderboard monitoring
- Study plan management (create, edit, assign problems)
- Editorial and hint management

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, React Router, Monaco Editor, Axios, CSS, Lucide Icons |
| Backend | Java, Spring Boot, Spring Security, JWT, Spring Data JPA, Hibernate |
| Database | PostgreSQL, Flyway |
| Execution | Docker (warm container pool) |
| API | REST APIs, Swagger/OpenAPI |
| Build | Maven, npm |
| Testing | JUnit |
| Version Control | Git, GitHub |

## System Architecture

```
                              USER
                                |
                                v
                    +-----------------------+
                    |     React Frontend     |
                    | Problems / Editor /     |
                    | Dashboard / Study Plans |
                    +-----------+-------------+
                                |
                              REST API
                                |
                                v
                    +-----------------------+
                    |    Spring Boot API      |
                    |  Auth · Problems ·      |
                    |  Submissions · Admin    |
                    +-----+--------------+----+
                          |              |
                          v              v
                 +----------------+  +---------------------------+
                 |   PostgreSQL   |  |   Docker Execution Layer   |
                 |    Database    |  |                            |
                 +----------------+  |  Warm container pool       |
                                     |  (pre-started, reused via   |
                                     |  docker exec — no per-      |
                                     |  submission container       |
                                     |  startup cost)               |
                                     |                            |
                                     |  Network-isolated ·         |
                                     |  CPU/memory-limited ·        |
                                     |  time-limited execution      |
                                     +---------------------------+
```

## Submission Evaluation

```
Source Code
    │
    ▼
Submission Service
    │
    ▼
Acquire a warm worker container from the pool
    │
    ▼
Copy source into container → Compile → Execute
    │
    ▼
Run against test cases (input piped via stdin)
    │
    ▼
Compare actual vs. expected output
    │
    ▼
Store Submission + Test Results → Release container back to pool
```

Supported submission statuses:
`PENDING`, `RUNNING`, `ACCEPTED`, `WRONG_ANSWER`, `COMPILATION_ERROR`, `RUNTIME_ERROR`, `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`

For each submission, the system tracks passed test cases, total test cases, execution time, memory usage, status, and error information.

## Submission Attempts and Accuracy

For a user's attempts on a specific problem:

- **Total attempts** — every submission made by the user
- **Correct attempts** — submissions with final status `ACCEPTED`
- **Accuracy** — correct attempts / total attempts × 100

**Example:**
```
Submission 1 → WRONG_ANSWER
Submission 2 → ACCEPTED
Submission 3 → WRONG_ANSWER

Correct attempts = 1
Total attempts   = 3
Accuracy         = 33.33%
```

## Problem Acceptance Rate

Acceptance rate is based on **unique users**, not raw submission count — a user is counted once even after multiple attempts.

```
Acceptance Rate = (Unique users with an accepted solution
                    / Unique users who submitted the problem) × 100
```

**Example:**
```
Sekhar → 5 submissions → ACCEPTED
Rahul  → 3 submissions → WRONG_ANSWER
Anil   → 1 submission  → ACCEPTED

Accepted unique users = 2
Total unique users     = 3
Acceptance Rate        = 2 / 3 × 100 = 66.67%
```

## Leaderboard

The global leaderboard ranks users based on coding performance.

| Difficulty | Points |
|---|---|
| Easy | 10 |
| Medium | 20 |
| Hard | 30 |

Points are awarded once per solved problem — repeated accepted submissions for the same problem don't award additional points. The leaderboard displays rank, username, problems solved, total score, acceptance rate, and fastest submission time. Admin accounts are excluded from the public leaderboard.

## Security

CodeArena uses Spring Security with JWT authentication.

```
Login → Credential Validation → JWT Generation
      → Authenticated API Requests → Spring Security Validation
      → Authorized Resource
```

Administrative APIs use role-based authorization.

## Docker Code Execution

User-submitted code runs inside a Docker-based sandbox, never inside the main application process. Rather than launching a fresh container per submission, CodeArena keeps a small pool of pre-started containers running continuously and executes each submission via `docker exec` into an available worker — eliminating per-submission container startup overhead.

The execution environment applies:
- CPU limits
- Memory limits
- Network isolation
- Execution time limits (enforced both by an in-container timeout and a supervising process on the backend)

> **Note:** Java execution is fully implemented end-to-end. Python, C++, and JavaScript are supported in the editor UI; server-side execution for these languages is planned but not yet implemented.

## Database

PostgreSQL is the primary relational database. Major entities include:

- User
- Problem
- TestCase
- Submission
- SubmissionResult
- LeaderboardEntry
- StudyPlan
- StudyPlanProblem

Flyway manages versioned database schema migrations.

## Project Structure

**Frontend**
```
frontend/
└── src/
    ├── components/
    ├── pages/
    ├── layouts/
    ├── services/
    ├── api/
    ├── hooks/
    ├── routes/
    ├── styles/
    ├── utils/
    ├── AuthContext/
    ├── App.js
    └── index.js
```

**Backend**
```
backend/
└── src/main/
    ├── java/com/codingplatform/coding_platform/
    │   ├── auth/
    │   ├── users/
    │   ├── problem/
    │   ├── testcase/
    │   ├── submission/
    │   ├── submissionresult/
    │   ├── execution/
    │   ├── dashboard/
    │   ├── leaderboard/
    │   ├── studyplan/
    │   └── security/
    └── resources/
        └── db/migration/
```

## Running Locally

### Prerequisites
- Java 17+
- Node.js and npm
- PostgreSQL
- Docker
- Maven

### Backend
```bash
cd backend
mvn spring-boot:run
```
Configure PostgreSQL and application properties before starting the backend.

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000`
Backend runs on the configured Spring Boot port.

## Testing

JUnit is used for backend testing. Recommended coverage areas:

- Authentication and authorization
- Problem APIs
- Test case management
- Submission creation
- Code execution
- Submission evaluation
- Dashboard calculations
- Leaderboard scoring
- Study plan operations
- Role-based access control

## API Areas

```
/api/auth/*
/api/problems/*
/api/submissions/*
/api/dashboard/*
/api/leaderboard/*
/api/study-plans/*
/api/admin/*
```

Swagger/OpenAPI can be used to explore and test the available APIs.

## Project Outcome

CodeArena brings the complete coding-practice workflow into one platform:

**Discover → Practice → Execute → Submit → Evaluate → Track → Improve**

The project demonstrates practical experience in full-stack development, REST API design, authentication and authorization, relational database design, automated code evaluation, containerized execution, performance tracking, and role-based administration.

## Future Scope

- Coding contests with real-time rankings
- Additional programming languages (Python, C++, JavaScript execution)
- Advanced performance analytics
- AI-assisted coding support
- Personalized problem recommendations
- Discussion forums and social learning features
- Cloud deployment
- Horizontally scalable execution workers

## Developer

**Soma Sekhar Kamma**

Project: CodeArena

Domain: Java Full Stack Development

Program: Infosys Springboard Virtual Internship

## License

This project was developed as part of the Infosys Springboard Virtual Internship program.
>>>>>>> origin/cloned-project
