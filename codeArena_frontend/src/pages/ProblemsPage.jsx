import React, {
  useState,
  useMemo,
  useEffect
} from "react";

import {
  Search,
  Bell,
  Coins,
  ChevronDown,
  Lock,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutDashboard,
  LogOut
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import "../styles/ProblemsPage.css";
import api from "../services/axios";



function diffClass(diff) {

  const value =
    String(diff || "").toUpperCase();

  if (value === "EASY") {
    return "lc-diff-easy";
  }

  if (value === "HARD") {
    return "lc-diff-hard";
  }

  return "lc-diff-med";
}

const DIFFICULTY_ORDER = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};


// ---------------------------------------------------------------------------
// Problem Status
// ---------------------------------------------------------------------------

function StatusIcon({ solved }) {

  if (solved) {

    return (
      <Check
        size={16}
        className="lc-check-done"
        strokeWidth={3}
      />
    );
  }

  // return (
  //   <span className="lc-checkbox" />
  // );
}

// Checks whichever field your backend actually sends for "did this user
// solve this problem" — supports a plain boolean (p.solved) or a status
// string in a few common shapes, so this doesn't silently break if the
// backend field name changes.
function isProblemSolved(p) {
  if (p.solved === true) return true;
  const status = String(p.status || "").toUpperCase();
  return status === "SOLVED" || status === "DONE" || status === "ACCEPTED";
}


// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------
//
// Everything here derives from real Date objects and the real submission
// data the backend returns — nothing about "today", "this month", or which
// days are marked is hardcoded.
//
// NOTE ON "COMPLETED" MARKING: real LeetCode marks a day complete only if
// the user finished THAT DAY'S specific daily-challenge problem. Your
// backend doesn't have that concept yet (no daily-challenge-problem /
// completion table) — only a general submission heatmap. So for now, a day
// is shown as "completed" if the user submitted anything that day. This is
// a reasonable stand-in, but it isn't the true daily-challenge semantic
// until the backend adds that concept.
// ---------------------------------------------------------------------------

function formatDateKey(date) {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildMonthGrid(year, month) {

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return cells;
}

function formatCountdown(ms) {

  if (ms <= 0) {
    return "0h 0m 0s left";
  }

  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s left`;
}


// ---------------------------------------------------------------------------
// Problems Page
// ---------------------------------------------------------------------------

export default function ProblemsPage() {

  const navigate = useNavigate();

  const [query, setQuery] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("All Topics");

  const [problems, setProblems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  useEffect(() => {

  let cancelled = false;

  async function fetchProblems() {

    setLoading(true);
    setError(null);

    try {

      const response = await api.get("/problems");

      console.log("Problems response:", response.data);

      if (!cancelled) {

        setProblems(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      }

    } catch (err) {

      console.error(
        "Failed to load problems:",
        err
      );

      if (!cancelled) {

        setProblems([]);

        setError(
          err.response?.data?.message ||
          "Couldn't load problems"
        );

      }

    } finally {

      if (!cancelled) {
        setLoading(false);
      }

    }

  }

  fetchProblems();

  return () => {
    cancelled = true;
  };

}, []);

  const topicCounts = useMemo(() => {

    const counts = {};

    problems.forEach((problem) => {

      if (!problem.topic) {
        return;
      }

      const topics =
        String(problem.topic)
          .split(",")
          .map((topic) =>
            topic.trim()
          )
          .filter(Boolean);

      topics.forEach((topic) => {

        counts[topic] =
          (counts[topic] || 0) + 1;
      });

    });

    return counts;

  }, [problems]);

  const topics = useMemo(() => {

    return Object.entries(
      topicCounts
    )
      .map(([name, count]) => ({
        name,
        count
      }))
      .sort((a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name)
      );

  }, [topicCounts]);

  const tabs = useMemo(() => {

    return [
      "All Topics",
      ...topics.map(
        (topic) => topic.name
      )
    ];

  }, [topics]);

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [difficultyFilters, setDifficultyFilters] = useState(new Set());

  function toggleDifficultyFilter(diff) {

    setDifficultyFilters((prev) => {

      const next = new Set(prev);

      if (next.has(diff)) {
        next.delete(diff);
      } else {
        next.add(diff);
      }

      return next;
    });
  }

  function chooseSort(field) {

    if (sortBy === field) {

      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));

    } else {

      setSortBy(field);
      setSortDir("asc");
    }

    setSortMenuOpen(false);
  }

  const filtered = useMemo(() => {

    let result =
      problems;

    if (
      activeTab !== "All Topics"
    ) {

      result =
        result.filter((problem) => {

          if (!problem.topic) {
            return false;
          }

          const problemTopics =
            String(problem.topic)
              .split(",")
              .map((topic) =>
                topic.trim()
              );

          return problemTopics
            .some(
              (topic) =>
                topic.toLowerCase() ===
                activeTab.toLowerCase()
            );
        });
    }

    if (difficultyFilters.size > 0) {

      result = result.filter((problem) =>
        difficultyFilters.has(
          String(problem.difficulty || "").toUpperCase()
        )
      );
    }

    if (query.trim()) {

      const q = query.toLowerCase();

      result = result.filter(
        (problem) =>
          problem.title
            ?.toLowerCase()
            .includes(q) ||
          String(problem.id)
            .includes(q)
      );
    }

    const sorted = [...result];

    sorted.sort((a, b) => {

      let comparison = 0;

      if (sortBy === "id") {

        comparison = (a.id ?? 0) - (b.id ?? 0);

      } else if (sortBy === "difficulty") {

        const aRank = DIFFICULTY_ORDER[String(a.difficulty || "").toUpperCase()] || 0;
        const bRank = DIFFICULTY_ORDER[String(b.difficulty || "").toUpperCase()] || 0;

        comparison = aRank - bRank;

      } else if (sortBy === "acceptance") {

        const aAcc = a.acceptanceRate ?? a.acceptance ?? 0;
        const bAcc = b.acceptanceRate ?? b.acceptance ?? 0;

        comparison = aAcc - bAcc;
      }

      return sortDir === "asc" ? comparison : -comparison;
    });

    return sorted;

  }, [
    problems,
    query,
    activeTab,
    difficultyFilters,
    sortBy,
    sortDir
  ]);

  // Reflects real per-user solved status once your backend's /problems
  // response includes it (via `solved` or `status`) — see isProblemSolved.
  const solvedCount =
    problems.filter(isProblemSolved).length;

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  const [calendarDate, setCalendarDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [activeDates, setActiveDates] = useState(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [calendarLoading, setCalendarLoading] = useState(true);

  useEffect(() => {

    let cancelled = false;

    async function fetchStreak() {

      setCalendarLoading(true);

      try {

        const response = await api.get("/dashboard");

        const heatmapDays =
          Array.isArray(response.data?.submissionHeatmap)
            ? response.data.submissionHeatmap
            : [];

        if (cancelled) {
          return;
        }

        const dateSet = new Set(

          heatmapDays
            .filter((day) => day && day.date && day.count > 0)
            .map((day) => day.date)

        );

        setActiveDates(dateSet);

        let streak = 0;
        let cursor = new Date(today);

        while (dateSet.has(formatDateKey(cursor))) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        }

        setCurrentStreak(streak);

      } catch (err) {

        console.error(
          "Failed to load streak calendar:",
          err
        );

        if (!cancelled) {
          setActiveDates(new Set());
          setCurrentStreak(0);
        }

      } finally {

        if (!cancelled) {
          setCalendarLoading(false);
        }

      }

    }

    fetchStreak();

    return () => {
      cancelled = true;
    };

  }, [today]);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  const msUntilMidnight = useMemo(() => {

    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );

    return midnight.getTime() - now.getTime();

  }, [now]);

  const monthLabel = useMemo(() =>

    calendarDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    }),

  [calendarDate]);

  const monthCells = useMemo(() =>

    buildMonthGrid(
      calendarDate.getFullYear(),
      calendarDate.getMonth()
    ),

  [calendarDate]);

  function goToPrevMonth() {

    setCalendarDate((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {

    setCalendarDate((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  function isToday(day) {

    return (
      day === today.getDate() &&
      calendarDate.getMonth() === today.getMonth() &&
      calendarDate.getFullYear() === today.getFullYear()
    );
  }

  function cellDateKey(day) {

    return formatDateKey(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        day
      )
    );
  }

  function isCompleted(day) {
    return activeDates.has(cellDateKey(day));
  }

  function isMissed(day) {

    const key = cellDateKey(day);

    return key < todayKey && !activeDates.has(key);
  }

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  function handleLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    navigate("/login");
  }

  return (

    <div className="lc-page">

      <header className="lc-header">

        <div className="lc-logo">

          <span className="lc-logo-icon">
            ⌂
          </span>

          CodeArena

        </div>

        <nav className="lc-nav">

          <span className="lc-nav-active">
            Problems
          </span>

          <Link
  to="/study-plans"
  className="lc-nav-item"
>
  Studyplan
</Link>

<Link
  to="/submissions"
  className="lc-nav-item"
>
  Submissions
</Link>

<Link
  to="/leaderboard"
  className="lc-nav-dropdown"
>
  Leaderboard

  
</Link>

        </nav>

        <div className="lc-spacer" />

        <div className="lc-header-right">

          <div className="lc-search-pill">

            <Search
              size={14}
              className="lc-icon-muted"
            />

            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search"
            />

          </div>

          <Bell
            size={18}
            className="lc-icon-muted"
          />

          <div className="lc-header-streak">

            <Flame size={15} />

            {calendarLoading ? "—" : currentStreak}

          </div>

          <div className="lc-profile-wrap">

            <div
              className="lc-avatar"
              onClick={() =>
                setProfileMenuOpen((open) => !open)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" ||
                  e.key === " "
                ) {

                  setProfileMenuOpen((open) => !open);
                }

              }}
            />

            {profileMenuOpen && (

              <>

                <div
                  className="lc-menu-backdrop"
                  onClick={() => setProfileMenuOpen(false)}
                />

                <div className="lc-profile-menu">

                  <button
                    className="lc-profile-menu-item"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/users");
                    }}
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>

                  <button
                    className="lc-profile-menu-item lc-profile-menu-item-danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      </header>

      <div className="lc-body">

        <main className="lc-main">

          <div className="lc-topics">

            {topics.map((topic) => (

              <span
                key={topic.name}
                onClick={() =>
                  setActiveTab(
                    topic.name
                  )
                }
                style={{
                  cursor: "pointer"
                }}
              >

                {topic.name}

                {" "}

                <span className="lc-topic-count">
                  {topic.count}
                </span>

              </span>

            ))}

            {topics.length > 0 && (

              <span>
                Expand ⌄
              </span>

            )}

          </div>

          <div className="lc-tabs">

            {tabs.map((tab) => (

              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`lc-tab ${
                  activeTab === tab
                    ? "lc-tab-active"
                    : ""
                }`}
              >

                {tab}

              </button>

            ))}

          </div>

          <div className="lc-controls">

            <div className="lc-search-box">

              <Search
                size={14}
                className="lc-icon-muted"
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search questions"
              />

            </div>

            <div className="lc-menu-wrap">

              <button
                className="lc-icon-btn"
                onClick={() => {
                  setSortMenuOpen((open) => !open);
                  setFilterMenuOpen(false);
                }}
                title="Sort"
              >

                <ArrowUpDown
                  size={14}
                />

              </button>

              {sortMenuOpen && (

                <>

                  <div
                    className="lc-menu-backdrop"
                    onClick={() => setSortMenuOpen(false)}
                  />

                  <div className="lc-dropdown-menu">

                    {[
                      { key: "id", label: "Problem ID" },
                      { key: "difficulty", label: "Difficulty" },
                      { key: "acceptance", label: "Acceptance Rate" },
                    ].map((opt) => (

                      <button
                        key={opt.key}
                        className={`lc-dropdown-item ${
                          sortBy === opt.key ? "lc-dropdown-item-active" : ""
                        }`}
                        onClick={() => chooseSort(opt.key)}
                      >

                        {opt.label}

                        {sortBy === opt.key && (
                          <span className="lc-sort-dir">
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        )}

                      </button>

                    ))}

                  </div>

                </>

              )}

            </div>

            <div className="lc-menu-wrap">

              <button
                className="lc-icon-btn"
                onClick={() => {
                  setFilterMenuOpen((open) => !open);
                  setSortMenuOpen(false);
                }}
                title="Filter by difficulty"
              >

                <SlidersHorizontal
                  size={14}
                />

              </button>

              {filterMenuOpen && (

                <>

                  <div
                    className="lc-menu-backdrop"
                    onClick={() => setFilterMenuOpen(false)}
                  />

                  <div className="lc-dropdown-menu">

                    {["EASY", "MEDIUM", "HARD"].map((diff) => (

                      <button
                        key={diff}
                        className={`lc-dropdown-item ${
                          difficultyFilters.has(diff) ? "lc-dropdown-item-active" : ""
                        }`}
                        onClick={() => toggleDifficultyFilter(diff)}
                      >

                        {diff.charAt(0) + diff.slice(1).toLowerCase()}

                        {difficultyFilters.has(diff) && (
                          <Check size={13} />
                        )}

                      </button>

                    ))}

                  </div>

                </>

              )}

            </div>

            <div className="lc-spacer" />

            <span className="lc-solved-count">

              {solvedCount}/
              {problems.length}
              {" "}
              Solved

            </span>

          </div>

          <div className="lc-table-wrap">

            <table className="lc-table">

              <tbody>

                {loading && (

                  <tr>

                    <td
                      colSpan={5}
                      className="lc-table-empty"
                    >
                      Loading problems…
                    </td>

                  </tr>

                )}

                {!loading &&
                  error && (

                  <tr>

                    <td
                      colSpan={5}
                      className="lc-table-error"
                    >
                      {error}
                    </td>

                  </tr>

                )}

                {!loading &&
                  !error &&
                  problems.length === 0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="lc-table-empty"
                    >

                      <div className="lc-table-empty-title">
                        No problems yet
                      </div>

                      <div className="lc-table-empty-sub">
                        An admin hasn't added any problems. Once they do, they'll show up here.
                      </div>

                    </td>

                  </tr>

                )}

                {!loading &&
  !error &&
  problems.length > 0 &&
  filtered.map((p, i) => (

    <tr
      key={p.id}
      className={`lc-row ${
        i % 2 === 0
          ? "lc-row-even"
          : "lc-row-odd"
      }`}
    >

      <td className="lc-td-status">

        <StatusIcon
          solved={isProblemSolved(p)}
        />

      </td>

      <td className="lc-td-title">

        <a href={`/problems/${p.id}`}>

          {p.id}.
          {" "}
          {p.title}

        </a>

      </td>

      <td className="lc-td-acc">

        {(p.acceptanceRate ?? p.acceptance) != null
          ? `${p.acceptanceRate ?? p.acceptance}%`
          : "-"
        }

      </td>

      <td
        className={`lc-td-diff ${
          diffClass(p.difficulty)
        }`}
      >

        {p.difficulty
          ? p.difficulty.charAt(0).toUpperCase() +
            p.difficulty.slice(1).toLowerCase()
          : "-"
        }

      </td>

      <td className="lc-td-lock">

      </td>

    </tr>

  ))
}
                {!loading &&
                  !error &&
                  problems.length > 0 &&
                  filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="lc-table-empty"
                    >
                      No problems match your search.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </main>

        <aside className="lc-aside">

          <div className="lc-card">

            <div className="lc-card-row">

              <span>

                Day {today.getDate()}

                {" "}

                <span className="lc-streak-days-left">
                  {formatCountdown(msUntilMidnight)}
                </span>

              </span>

              <div className="lc-streak-badge">

                🔥 {calendarLoading ? "—" : currentStreak}

              </div>

            </div>

            <div className="lc-cal-nav">

              <ChevronLeft
                size={14}
                onClick={goToPrevMonth}
                style={{ cursor: "pointer" }}
              />

              <span>
                {monthLabel}
              </span>

              <ChevronRight
                size={14}
                onClick={goToNextMonth}
                style={{ cursor: "pointer" }}
              />

            </div>

            <div className="lc-cal-grid">

              {[
                "S",
                "M",
                "T",
                "W",
                "T",
                "F",
                "S"
              ].map(
                (d, i) => (

                <div
                  className="lc-cal-head"
                  key={i}
                >
                  {d}
                </div>

              ))}

              {monthCells.map(
                (day, i) => (

                day === null ? (

                  <div
                    key={`blank-${i}`}
                    className="lc-cal-day"
                  />

                ) : (

                  <div
                    key={day}
                    className={`lc-cal-day ${
                      isToday(day) ? "lc-cal-today" : ""
                    }`}
                  >

                    {day}

                    {isCompleted(day) && (
                      <CheckCircle2
                        size={11}
                        className="lc-cal-check"
                      />
                    )}

                    {!isCompleted(day) && isMissed(day) && (
                      <span className="lc-cal-missed-dot" />
                    )}

                  </div>

                )

              ))}

            </div>

          </div>

        </aside>

      </div>

    </div>

  );
}