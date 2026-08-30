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
  Star,
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

import {
  useNavigate
} from "react-router-dom";

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

function StatusIcon({ status }) {

  if (status === "done") {

    return (
      <Check
        size={16}
        className="lc-check-done"
        strokeWidth={3}
      />
    );
  }

  return (
    <span className="lc-checkbox" />
  );
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

  // month is 0-indexed (0 = January), matching JS Date conventions.

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday

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


  // ---------------- Search ----------------

  const [query, setQuery] =
    useState("");


  // ---------------- Topic ----------------

  const [activeTab, setActiveTab] =
    useState("All Topics");


  // ---------------- Problems ----------------

  const [problems, setProblems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // -------------------------------------------------------------------------
  // Load problems from backend
  // -------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Dynamic topics
// ---------------------------------------------------------------------------
//
// Your backend currently has one `topic` String field.
//
// We also support comma-separated topics:
//
// "Array, Hash Table"
//
// so the frontend can count both topics correctly.
// ---------------------------------------------------------------------------

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


  // -------------------------------------------------------------------------
  // Topics shown at top
  // -------------------------------------------------------------------------

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


  // -------------------------------------------------------------------------
  // Topic filter tabs
  // -------------------------------------------------------------------------

  const tabs = useMemo(() => {

    return [
      "All Topics",
      ...topics.map(
        (topic) => topic.name
      )
    ];

  }, [topics]);


  // -------------------------------------------------------------------------
  // Sort + difficulty filter controls
  // -------------------------------------------------------------------------

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("id"); // "id" | "difficulty" | "acceptance"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

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

      // clicking the same field again flips direction
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));

    } else {

      setSortBy(field);
      setSortDir("asc");
    }

    setSortMenuOpen(false);
  }


  // -------------------------------------------------------------------------
  // Filter problems (topic + search + difficulty), then sort
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {

    let result =
      problems;


    // Topic filter

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


    // Difficulty filter

    if (difficultyFilters.size > 0) {

      result = result.filter((problem) =>
        difficultyFilters.has(
          String(problem.difficulty || "").toUpperCase()
        )
      );
    }


    // Search filter

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


    // Sort

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


  // -------------------------------------------------------------------------
  // Solved count
  // -------------------------------------------------------------------------
  //
  // For now this remains based on submission status if the backend later
  // provides it. Your current ProblemResponse does not contain status, so
  // this will naturally remain 0 until we connect user submissions.
  // -------------------------------------------------------------------------

  const solvedCount =
    problems.filter(
      (p) =>
        p.status === "done"
    ).length;


  // -------------------------------------------------------------------------
  // Streak + calendar — real data
  // -------------------------------------------------------------------------

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


        // Current streak: consecutive days ending today with activity.
        // Stops at the first gap.

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


  // Live countdown to midnight, so "Xh Ym Zs left" is real and ticking.

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

    // A day counts as "missed" only if it's strictly before today and
    // nothing was submitted on it. Future days and today itself never get
    // the red dot — today isn't over yet, and the future hasn't happened.

    const key = cellDateKey(day);

    return key < todayKey && !activeDates.has(key);
  }


  // -------------------------------------------------------------------------
  // Header: streak display + profile dropdown + logout
  // -------------------------------------------------------------------------

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  function handleLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    navigate("/login");
  }


  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (

    <div className="lc-page">


      {/* ================================================================ */}
      {/* Top nav */}
      {/* ================================================================ */}

      <header className="lc-header">


        <div className="lc-logo">

          <span className="lc-logo-icon">
            ⌂
          </span>

          LeetCode

        </div>


        <nav className="lc-nav">

          <span className="lc-nav-active">
            Problems
          </span>


          <span className="lc-nav-item">
            Contest
          </span>


          <span className="lc-nav-item">
            Discuss
          </span>


          <span className="lc-nav-dropdown">

            Interview

            <ChevronDown size={14} />

          </span>

          {/* Store removed */}

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


          


          {/* Streak, mirrored from the calendar card */}

          <div className="lc-header-streak">

            <Flame size={15} />

            {calendarLoading ? "—" : currentStreak}

          </div>


          {/* ============================================================ */}
          {/* Profile — hover state, clickable, logout */}
          {/* ============================================================ */}

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


          {/* Premium removed */}

        </div>

      </header>


      <div className="lc-body">


        {/* ============================================================ */}
        {/* Main column */}
        {/* ============================================================ */}

        <main className="lc-main">


          {/* ============================================================ */}
          {/* Promo cards removed */}
          {/* ============================================================ */}


          {/* ============================================================ */}
          {/* Dynamic Topic chips */}
          {/* ============================================================ */}

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


          {/* ============================================================ */}
          {/* Dynamic Topic tabs */}
          {/* ============================================================ */}

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


          {/* ============================================================ */}
          {/* Search + controls */}
          {/* ============================================================ */}

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


            {/* Sort control */}

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


            {/* Difficulty filter control */}

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


          {/* ============================================================ */}
          {/* Problem table */}
          {/* ============================================================ */}

          <div className="lc-table-wrap">

            <table className="lc-table">

              <tbody>


                {/* Loading */}

                {loading && (

                  <tr>

                    <td
                      colSpan={6}
                      className="lc-table-empty"
                    >
                      Loading problems…
                    </td>

                  </tr>

                )}


                {/* Error */}

                {!loading &&
                  error && (

                  <tr>

                    <td
                      colSpan={6}
                      className="lc-table-error"
                    >
                      {error}
                    </td>

                  </tr>

                )}


                {/* No problems */}

                {!loading &&
                  !error &&
                  problems.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
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


                {/* Problems */}

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

      {/* Status */}
      <td className="lc-td-status">

        <StatusIcon
          status={p.status}
        />

      </td>


      {/* Problem title */}
      <td className="lc-td-title">

        <a href={`/problems/${p.id}`}>

          {p.id}.
          {" "}
          {p.title}

        </a>

      </td>


      {/* Acceptance */}
      <td className="lc-td-acc">

        {(p.acceptanceRate ?? p.acceptance) != null
          ? `${p.acceptanceRate ?? p.acceptance}%`
          : "-"
        }

      </td>


      {/* Difficulty */}
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


      {/* Lock */}
      <td className="lc-td-lock">

      </td>


      {/* Star */}
      <td className="lc-td-star">

        <Star size={14} />

      </td>


    </tr>

  ))
}
                {/* Search/filter empty */}

                {!loading &&
                  !error &&
                  problems.length > 0 &&
                  filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
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


        {/* ================================================================ */}
        {/* Right sidebar */}
        {/* ================================================================ */}

        <aside className="lc-aside">


          {/* Calendar — real, backend-driven */}

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