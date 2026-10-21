import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Rocket, Monitor, Trophy, TrendingUp } from "lucide-react";

import "../styles/LandingPage.css";
// ---------------------------------------------------------------------------
// Marketing copy (hero text, feature cards, language list, "how it works"
// steps, footer) is static content and stays hardcoded — it's copy, not data.
//
// The stats bar and leaderboard preview show real platform numbers, so those
// are fetched from your Spring Boot backend and fall back to an honest empty
// state rather than fake numbers:
//   GET /api/platform/stats       -> { activeUsers, totalProblems, totalSubmissions, totalTopics }
//   GET /api/leaderboard/top?limit=4 -> [{ rank, username, solved, accuracy }]
// ---------------------------------------------------------------------------

async function apiFetch(url) {
  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("application/json")) return { ok: false, data: null };
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false, data: null };
  }
}

const FEATURES = [
  {
    icon: Monitor,
    title: "Coding Problems",
    desc: "Solve interview and competitive programming questions categorized by topic and difficulty.",
  },
  {
    icon: Monitor,
    title: "Contests",
    desc: "Join weekly coding contests, tackle real-world programming challenges, and compete with developers across the globe.",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    desc: "Compete with developers worldwide and improve your global ranking.",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    desc: "Track solved problems, streaks, acceptance rate and language statistics.",
  },
];

const LANGUAGES = ["Java", "Python", "C++", "JavaScript"];



const STEPS = [
  { n: 1, title: "Choose a Problem" },
  { n: 2, title: "Write Your Code" },
  { n: 3, title: "Run Test Cases" },
  { n: 4, title: "Submit Solution" },
  { n: 5, title: "Track Progress" },
];

function rankClass(rank) {
  if (rank === 1) return "lp-rank-badge lp-rank-1";
  if (rank === 2) return "lp-rank-badge lp-rank-2";
  if (rank === 3) return "lp-rank-badge lp-rank-3";
  return "lp-rank-badge";
}

const DEMO_STATS = { activeUsers: 128, totalProblems: 42, totalSubmissions: 386, totalTopics: 12 };

const DEMO_LEADERS = [
  { rank: 1, username: "CodeMaster", solved: 24, accuracy: 92 },
  { rank: 2, username: "JavaPro", solved: 19, accuracy: 88 },
  { rank: 3, username: "AlgoExpert", solved: 16, accuracy: 84 },
  { rank: 4, username: "CodeNinja", solved: 11, accuracy: 78 },
];

export default function LandingPage() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  const [leaders, setLeaders] = useState(DEMO_LEADERS);
  const [leadersLoading, setLeadersLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setStatsLoading(true);
      const { ok, data } = await apiFetch("/api/platform/stats");
      if (ok && data && (Number(data.activeUsers) > 0 || Number(data.totalProblems) > 0 || Number(data.totalSubmissions) > 0 || Number(data.totalTopics) > 0)) {
        setStats(data);
      } else {
        setStats(DEMO_STATS);
      }
      setStatsLoading(false);
    })();

    (async () => {
      setLeadersLoading(true);
      const { ok, data } = await apiFetch("/api/leaderboard/top?limit=4");
      if (ok && Array.isArray(data) && data.length > 0) {
        setLeaders(data);
      } else {
        setLeaders(DEMO_LEADERS);
      }
      setLeadersLoading(false);
    })();
  }, []);

  return (
    <div className="lp-page">
      {/* ---------------- Navbar ---------------- */}
      <header className="lp-navbar">
        <div className="lp-container lp-navbar-inner">
          <div className="lp-logo">CodeArena</div>
          <nav className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#languages">Languages</a>
            <a href="#leaderboard">Leaderboard</a>
            <a href="#about">About</a>
          </nav>
          <div className="lp-nav-spacer" />
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn lp-btn-ghost">Login</Link>
            <Link to="/register" className="lp-btn lp-btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-badge-pill"><Rocket size={13} /> Practice Like a Pro</span>
            <h1 className="lp-hero-title">
              Improve Your Coding Skills With
              <span className="lp-hero-title-accent">CodeArena</span>
            </h1>
            <p className="lp-hero-sub">
              Solve coding challenges, compete on leaderboards, execute code securely, and prepare for
              technical interviews with real-world programming problems.
            </p>
            <div className="lp-hero-actions">
              <Link to="/register" className="lp-btn lp-btn-primary">Start Coding</Link>
              <Link to="/problems" className="lp-btn lp-btn-outline">Explore Problems</Link>
            </div>
          </div>

          <div className="lp-hero-code">
            <div className="lp-code-card">
              <div className="lp-code-titlebar">
                <span className="lp-code-dots">
                  <span className="lp-code-dot lp-code-dot-red" />
                  <span className="lp-code-dot lp-code-dot-yellow" />
                  <span className="lp-code-dot lp-code-dot-green" />
                </span>
                Main.java
              </div>
              <div className="lp-code-body">
                <div><span className="lp-code-kw">public class</span> <span className="lp-code-fn">Main</span> <span className="lp-code-punc">{"{"}</span></div>
                <div>&nbsp;&nbsp;<span className="lp-code-kw">public static void</span> <span className="lp-code-fn">main</span><span className="lp-code-punc">(String[] args) {"{"}</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span className="lp-code-str">"Hello CodeArena"</span>);</div>
                <div>&nbsp;&nbsp;<span className="lp-code-punc">{"}"}</span></div>
                <div><span className="lp-code-punc">{"}"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Platform Features</h2>
            <p className="lp-section-sub">Everything you need to become interview ready.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div className="lp-feature-card" key={f.title}>
                  <div className="lp-feature-icon"><Icon size={22} /></div>
                  <div className="lp-feature-title">{f.title}</div>
                  <div className="lp-feature-desc">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Stats bar (live) ---------------- */}
      <section className="lp-stats-bar">
        <div className="lp-container lp-stats-grid">
          <div className="lp-stat-box">
            <div className="lp-stat-value">{statsLoading ? "—" : `${stats.activeUsers}+`}</div>
            <div className="lp-stat-label">Active Users</div>
          </div>
          <div className="lp-stat-box">
            <div className="lp-stat-value">{statsLoading ? "—" : `${stats.totalProblems}+`}</div>
            <div className="lp-stat-label">Coding Problems</div>
          </div>
          <div className="lp-stat-box">
            <div className="lp-stat-value">{statsLoading ? "—" : `${stats.totalSubmissions}+`}</div>
            <div className="lp-stat-label">Submissions</div>
          </div>
          <div className="lp-stat-box">
            <div className="lp-stat-value">{statsLoading ? "—" : `${stats.totalTopics}+`}</div>
            <div className="lp-stat-label">Problem Topics</div>
          </div>
        </div>
      </section>

      {/* ---------------- Supported languages ---------------- */}
      <section className="lp-section" id="languages">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Supported Languages</h2>
            <p className="lp-section-sub">Practice using your favorite programming language.</p>
          </div>
          <div className="lp-lang-row">
            {LANGUAGES.map((l) => (
              <div className="lp-lang-pill" key={l}>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">How It Works</h2>
            <p className="lp-section-sub">Five simple steps to master coding.</p>
          </div>
          <div className="lp-steps-grid">
            {STEPS.map((s) => (
              <div className="lp-step-card" key={s.n}>
                <div className="lp-step-number">{s.n}</div>
                <div className="lp-step-title">{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Leaderboard preview (live) ---------------- */}
      <section className="lp-section" id="leaderboard">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Leaderboard</h2>
          </div>
          <table className="lp-leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Solved</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leadersLoading ? (
                <tr>
                  <td colSpan={4} className="lp-leaderboard-empty">Loading leaderboard…</td>
                </tr>
              ) : leaders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="lp-leaderboard-empty">
                    No rankings yet — be the first to solve a problem and claim the top spot.
                  </td>
                </tr>
              ) : (
                leaders.map((u) => (
                  <tr key={u.rank}>
                    <td><span className={rankClass(u.rank)}>{u.rank}</span></td>
                    <td>{u.username}</td>
                    <td>{u.solved}</td>
                    <td>{u.accuracy}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="lp-cta">
        <div className="lp-container">
          <h2 className="lp-cta-title">Start Solving. Keep Learning. Rank Higher.</h2>
          <p className="lp-cta-sub">Join thousands of developers improving their coding skills every day.</p>
          <Link to="/register" className="lp-btn lp-btn-primary">Get Started</Link>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="lp-footer" id="about">
        <div className="lp-footer-logo">CodeArena</div>
        <div className="lp-footer-tagline">Practice. Learn. Compete.</div>
        <div className="lp-footer-links">
          <a href="#top">Home</a>
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="lp-footer-copy">© 2026 CodeArena. All Rights Reserved.</div>
      </footer>
    </div>
  );
}