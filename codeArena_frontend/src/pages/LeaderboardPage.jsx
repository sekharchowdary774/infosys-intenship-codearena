import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Code2,
  Target,
  Zap,
} from "lucide-react";

import { getGlobalLeaderboard } from "../api/leaderboardApi";
import "../styles/LeaderboardPage.css";

function formatTime(timeMs) {
  if (timeMs == null) {
    return "-";
  }

  return `${timeMs} ms`;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getGlobalLeaderboard();

        setLeaderboard(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load leaderboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="leaderboard-page">

      <header className="leaderboard-header">

        <div>
          <Link
            to="/problemset"
            className="leaderboard-back"
          >
            <ArrowLeft size={16} />
            Back to Problems
          </Link>

          <div className="leaderboard-title-row">
            <Trophy size={28} />

            <div>
              <h1>Global Leaderboard</h1>

              <p>
                Compete with developers and climb the rankings.
              </p>
            </div>
          </div>
        </div>

        <div className="leaderboard-stat">
          <Code2 size={18} />
          {leaderboard.length} developers
        </div>

      </header>

      <main className="leaderboard-content">

        {loading && (
          <div className="leaderboard-state">
            Loading leaderboard...
          </div>
        )}

        {!loading && error && (
          <div className="leaderboard-state leaderboard-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          leaderboard.length === 0 && (
            <div className="leaderboard-state">
              <Trophy size={36} />

              <h3>No leaderboard data yet</h3>

              <p>
                Solve problems to appear on the leaderboard.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          leaderboard.length > 0 && (
            <div className="leaderboard-table-wrapper">

              <table className="leaderboard-table">

                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Developer</th>
                    <th>Solved</th>
                    <th>Points</th>
                    <th>Acceptance</th>
                    <th>Fastest</th>
                  </tr>
                </thead>

                <tbody>

                  {leaderboard.map((user) => (
                    <tr key={user.userId}>

                      <td>
                        <div className="leaderboard-rank">

                          {user.rank <= 3 ? (
                            <Medal size={17} />
                          ) : (
                            <span>
                              #{user.rank}
                            </span>
                          )}

                          {user.rank <= 3 && (
                            <span>
                              #{user.rank}
                            </span>
                          )}

                        </div>
                      </td>

                      <td>
                        <div className="leaderboard-user">

                          <div className="leaderboard-avatar">
                            {user.username
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <span>
                            {user.username}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="leaderboard-metric">
                          <Target size={15} />
                          {user.problemsSolved}
                        </div>
                      </td>

                      <td>
                        <strong className="leaderboard-points">
                          {user.totalScore}
                        </strong>
                      </td>

                      <td>
                        {user.acceptanceRate ?? 0}%
                      </td>

                      <td>
                        <div className="leaderboard-metric">
                          <Zap size={15} />
                          {formatTime(
                            user.fastestSubmissionTimeMs
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="leaderboard-points-info">
            <strong>Scoring:</strong>

            <span>Easy · 10 points</span>
            <span>Medium · 20 points</span>
            <span>Hard · 30 points</span>
          </div>
        )}

      </main>
    </div>
  );
}