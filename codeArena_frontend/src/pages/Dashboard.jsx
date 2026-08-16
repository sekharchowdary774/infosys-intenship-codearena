import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";


function Dashboard() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") || "Coder";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");

    navigate("/");
  };

  return (
    <div className="dashboard">

      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          CodeArena
        </div>

        <div className="dashboard-nav-right">
          <span className="dashboard-user">
            {username}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">

        <section className="dashboard-welcome">
          <p className="dashboard-label">
            DASHBOARD
          </p>

          <h1>
            Welcome back, {username} 👋
          </h1>

          <p>
            Continue solving problems, improve your skills,
            and compete with other developers.
          </p>
        </section>

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">💻</div>

            <h2>Problems</h2>

            <p>
              Practice coding problems and improve your
              problem-solving skills.
            </p>

            <button
              onClick={() => navigate("/problems")}
            >
              Explore Problems
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🏆</div>

            <h2>Contests</h2>

            <p>
              Participate in coding contests and compete
              with other programmers.
            </p>

            <button>
              View Contests
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>

            <h2>Leaderboard</h2>

            <p>
              Check your ranking and see how you compare
              with other developers.
            </p>

            <button>
              View Leaderboard
            </button>
          </div>

        </section>

        <section className="dashboard-stats">

          <div className="stat-card">
            <span>Problems Solved</span>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <span>Contests</span>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <span>Current Rank</span>
            <strong>-</strong>
          </div>

          <div className="stat-card">
            <span>Streak</span>
            <strong>0 🔥</strong>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;