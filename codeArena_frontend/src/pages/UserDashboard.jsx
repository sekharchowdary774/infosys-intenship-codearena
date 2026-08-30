import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Bell,
  Coins,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Check,
  FileCode2,
  MessageCircle,
} from "lucide-react";

import "../styles/UserDashboard.css";
import api from "../services/axios";

// ---------------------------------------------------------------------------
// User dashboard
//
// Backend endpoint:
//   GET /api/dashboard
//   GET /api/dashboard?year=2025   <-- NEW: used by the heatmap's year picker
//
// The "year" param is only used to refetch the heatmap portion of the
// dashboard response (submissionHeatmap / totalSubmissions / activeDays /
// maxStreak). If your DashboardController doesn't support `year` yet, this
// will just keep showing the current rolling-365-day heatmap when a past
// year is picked — share the controller and I'll wire the filtering in.
//
// Username:
//   localStorage
//
// Dashboard data:
//   solved statistics
//   languages
//   submission heatmap
//   recent submissions
//   active days
//   max streak
//   current rank
// ---------------------------------------------------------------------------

async function apiFetch(url) {
  try {
    const response = await api.get(url);

    return {
      ok: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`API error: ${url}`, error);

    return {
      ok: false,
      data: null,
    };
  }
}

const TABS = [
  {
    key: "recent-ac",
    label: "Recent AC",
    icon: CheckSquare,
  },
  {
    key: "solutions",
    label: "Solutions",
    icon: FileCode2,
  },
  {
    key: "discuss",
    label: "Discuss",
    icon: MessageCircle,
  },
];

// Weekday labels for the heatmap's left-hand column. Static because a
// calendar's day names don't come from a database — same as the "S M T W T
// F S" header on the Problems page calendar.

function buildDonutGradient(stats) {
  if (!stats) return "#262626";

  const segments = [
    {
      total: stats.easyTotal,
      solved: stats.easySolved,
      bright: "#2dd4bf",
      dim: "#164e44",
    },
    {
      total: stats.medTotal,
      solved: stats.medSolved,
      bright: "#fbbf24",
      dim: "#4d3a12",
    },
    {
      total: stats.hardTotal,
      solved: stats.hardSolved,
      bright: "#f87171",
      dim: "#4d1f1f",
    },
  ];

  const overallTotal = segments.reduce(
    (sum, segment) => sum + segment.total,
    0
  );

  if (!overallTotal) return "#262626";

  let angle = 0;
  const stops = [];

  segments.forEach((segment) => {
    const segmentDegrees =
      (segment.total / overallTotal) * 360;

    const brightFraction =
      segment.total
        ? segment.solved / segment.total
        : 0;

    const brightDegrees =
      segmentDegrees * brightFraction;

    stops.push(
      `${segment.bright} ${angle}deg ${angle + brightDegrees}deg`
    );

    stops.push(
      `${segment.dim} ${angle + brightDegrees}deg ${angle + segmentDegrees}deg`
    );

    angle += segmentDegrees;
  });

  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
}

function heatColor(count) {
  if (!count) return "ud-heatmap-cell";
  if (count <= 1) return "ud-heatmap-cell ud-heat-1";
  if (count <= 3) return "ud-heatmap-cell ud-heat-2";
  if (count <= 6) return "ud-heatmap-cell ud-heat-3";

  return "ud-heatmap-cell ud-heat-4";
}

// Width (in px) each week column occupies in the heatmap: 12px cell + 3px
// gap, matching .ud-heatmap-cell / .ud-heatmap-grid in the CSS.
const WEEK_COLUMN_WIDTH = 15;

export default function UserDashboard() {

  const navigate = useNavigate();

  const [solvedStats, setSolvedStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [languages, setLanguages] = useState([]);

  const [heatmap, setHeatmap] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  // -------------------------------------------------------------------
  // Heatmap year range: "current" = rolling past 365 days, otherwise a
  // specific calendar year. Options are derived from today's date, not
  // hardcoded — no fake years shown that don't make sense yet.
  // -------------------------------------------------------------------
  const [heatmapRange, setHeatmapRange] = useState("current");
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  const yearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const years = [];
    for (let y = thisYear; y >= thisYear - 4; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const [activeTab, setActiveTab] =
    useState("recent-ac");

  const [submissions, setSubmissions] =
    useState([]);

  const [submissionsLoading, setSubmissionsLoading] =
    useState(true);


  // =========================================================
  // LOAD DASHBOARD (stats, languages, submissions, initial heatmap)
  // =========================================================

  useEffect(() => {

    (async () => {

      setStatsLoading(true);
      setSubmissionsLoading(true);


      const { ok, data } =
        await apiFetch("/dashboard");


      if (ok && data) {

        // -------------------------------------------------
        // Problem statistics
        // -------------------------------------------------

        setSolvedStats({

          easySolved:
            data.easyProblemsSolved ?? 0,

          easyTotal:
            data.easyProblems ?? 0,


          medSolved:
            data.mediumProblemsSolved ?? 0,

          medTotal:
            data.mediumProblems ?? 0,


          hardSolved:
            data.hardProblemsSolved ?? 0,

          hardTotal:
            data.hardProblems ?? 0,
        });


        // -------------------------------------------------
        // Languages
        // -------------------------------------------------

        setLanguages(
          Array.isArray(data.languageUsage)
            ? data.languageUsage
            : []
        );


        // -------------------------------------------------
        // Recent submissions
        // -------------------------------------------------

        setSubmissions(
          Array.isArray(data.recentSubmissions)
            ? data.recentSubmissions
            : []
        );

      } else {

        // -------------------------------------------------
        // Empty state
        // -------------------------------------------------

        setSolvedStats({

          easySolved: 0,
          easyTotal: 0,

          medSolved: 0,
          medTotal: 0,

          hardSolved: 0,
          hardTotal: 0,
        });

        setLanguages([]);

        setSubmissions([]);
      }


      setStatsLoading(false);
      setSubmissionsLoading(false);

    })();

  }, []);


  // =========================================================
  // LOAD HEATMAP (separate so switching the year only refetches this)
  // =========================================================

  useEffect(() => {

    let cancelled = false;

    (async () => {

      setHeatmapLoading(true);

      const url =
        heatmapRange === "current"
          ? "/dashboard"
          : `/dashboard?year=${heatmapRange}`;

      const { ok, data } = await apiFetch(url);

      if (cancelled) {
        return;
      }

      if (ok && data) {

        setHeatmap({

          totalSubmissions:
            data.totalSubmissions ?? 0,

          activeDays:
            data.activeDays ?? 0,

          maxStreak:
            data.maxStreak ?? 0,

          days:
            Array.isArray(data.submissionHeatmap)
              ? data.submissionHeatmap
              : [],
        });

      } else {

        setHeatmap({
          totalSubmissions: 0,
          activeDays: 0,
          maxStreak: 0,
          days: [],
        });
      }

      setHeatmapLoading(false);

    })();

    return () => {
      cancelled = true;
    };

  }, [heatmapRange]);


  // =========================================================
  // TOTALS
  // =========================================================

  const totalSolved =
    solvedStats
      ? solvedStats.easySolved
        + solvedStats.medSolved
        + solvedStats.hardSolved
      : 0;


  const totalProblems =
    solvedStats
      ? solvedStats.easyTotal
        + solvedStats.medTotal
        + solvedStats.hardTotal
      : 0;


  const donutGradient =
    useMemo(
      () => buildDonutGradient(solvedStats),
      [solvedStats]
    );


  // =========================================================
  // HEATMAP — weeks grid
  // =========================================================

  const heatmapWeeks = useMemo(() => {

  if (
    !heatmap ||
    !heatmap.days ||
    heatmap.days.length === 0
  ) {
    return [];
  }

  const days = heatmap.days;

  const firstDate =
    new Date(days[0].date);

  const dayOfWeek =
    firstDate.getDay();

  // JavaScript:
  // Sunday = 0
  // Monday = 1
  // ...
  //
  // We want Sunday as row 0.

  const paddedDays = [
    ...Array(dayOfWeek).fill(null),
    ...days,
  ];

  const weeks = [];

  for (
    let i = 0;
    i < paddedDays.length;
    i += 7
  ) {
    weeks.push(
      paddedDays.slice(i, i + 7)
    );
  }

  return weeks;

}, [heatmap]);

  // =========================================================
  // HEATMAP — month labels, computed from real submission dates
  // (each day is expected to look like { date: "2026-05-14", count: 2 })
  // =========================================================

  const monthTicks =
    useMemo(() => {

      if (heatmapWeeks.length === 0) {
        return [];
      }

      const ticks = [];
      let lastMonth = null;

      heatmapWeeks.forEach((week, weekIndex) => {

        const firstDatedDay =
          week.find((day) => day && day.date);

        if (!firstDatedDay) {
          return;
        }

        const month =
          new Date(firstDatedDay.date).getMonth();

        if (month !== lastMonth) {
          ticks.push({ weekIndex, month });
          lastMonth = month;
        }

      });

      return ticks.map((tick, i) => {

        const nextWeekIndex =
          i + 1 < ticks.length
            ? ticks[i + 1].weekIndex
            : heatmapWeeks.length;

        const span =
          nextWeekIndex - tick.weekIndex;

        const label =
          new Date(2000, tick.month, 1)
            .toLocaleString("default", { month: "short" });

        return { ...tick, span, label };

      });

    }, [heatmapWeeks]);


  function selectHeatmapRange(range) {
    setHeatmapRange(range);
    setYearMenuOpen(false);
  }


  return (
    <div className="ud-page">

      {/* =====================================================
          TOP NAV
      ===================================================== */}

      <header className="ud-header">

        <div className="ud-logo">
          <span className="ud-logo-icon">⌂</span>
          CodeArena
        </div>


        <nav className="ud-nav">

          <span
            className="ud-nav-item"
            onClick={() => navigate("/problemset")}
            style={{ cursor: "pointer" }}
          >
            Problems
          </span>

          <span className="ud-nav-item">
            Contest
          </span>

          <span className="ud-nav-item">
            Discuss
          </span>

          <span className="ud-nav-item">
            Leaderboard
          </span>

          

        </nav>


        <div className="ud-spacer" />


        <div className="ud-header-right">

          <div className="ud-search-pill">

            <Search
              size={14}
              className="ud-icon-muted"
            />

            <input placeholder="Search" />

          </div>


          <Bell
            size={18}
            className="ud-icon-muted"
          />


          

        </div>

      </header>


      <div className="ud-body">


        {/* ===================================================
            LEFT SIDEBAR
        =================================================== */}

        <aside className="ud-sidebar">

          {/* PROFILE */}

          <div className="ud-card">

            <div className="ud-avatar-lg">

              <div className="ud-avatar-head"></div>

              <div className="ud-avatar-body"></div>

              <span className="ud-avatar-badge" />

            </div>


            <div className="ud-profile-name">

              {localStorage.getItem("username")
                || "Unnamed user"}

            </div>


            <button
                 className="ud-edit-btn"
                 onClick={() => navigate("/edit-profile")}
            >
            Edit Profile
            </button>

          </div>


          {/* =================================================
              LANGUAGES
          ================================================= */}

          <div className="ud-card">

            <div className="ud-section-title">
              Languages
            </div>


            {languages.length === 0 ? (

              <div className="ud-empty-note">
                No submissions yet.
              </div>

            ) : (

              languages.map((language) => (

                <div
                  className="ud-lang-row"
                  key={language.language}
                >

                  <span className="ud-lang-pill">
                    {language.language}
                  </span>

                  <span className="ud-lang-count">
                    {language.submissionCount} submissions
                  </span>

                </div>

              ))

            )}

          </div>

        </aside>


        {/* ===================================================
            MAIN COLUMN
        =================================================== */}

        <main className="ud-main">


          {/* =================================================
              SOLVED STATISTICS
          ================================================= */}

          <div className="ud-top-row">


            <div className="ud-card ud-solved-card">

              <div className="ud-donut-wrap">

                <div
                  className="ud-donut-ring"
                  style={{
                    background: donutGradient,
                  }}
                />

                <div className="ud-donut-hole" />


                <div className="ud-donut-center">

                  <div className="ud-donut-value">

                    {statsLoading
                      ? "—"
                      : totalSolved}

                    <span>

                      /
                      {statsLoading
                        ? "—"
                        : totalProblems}

                    </span>

                  </div>


                  <div className="ud-donut-label">
                    ✓ Solved
                  </div>

                </div>

              </div>


              <div className="ud-diff-breakdown">


                {/* EASY */}

                <div className="ud-diff-pill">

                  <span className="ud-diff-pill-easy">
                    Easy
                  </span>

                  <span className="ud-diff-pill-count">

                    {statsLoading
                      ? "—/—"
                      : `${solvedStats.easySolved}/${solvedStats.easyTotal}`}

                  </span>

                </div>


                {/* MEDIUM */}

                <div className="ud-diff-pill">

                  <span className="ud-diff-pill-med">
                    Med.
                  </span>

                  <span className="ud-diff-pill-count">

                    {statsLoading
                      ? "—/—"
                      : `${solvedStats.medSolved}/${solvedStats.medTotal}`}

                  </span>

                </div>


                {/* HARD */}

                <div className="ud-diff-pill">

                  <span className="ud-diff-pill-hard">
                    Hard
                  </span>

                  <span className="ud-diff-pill-count">

                    {statsLoading
                      ? "—/—"
                      : `${solvedStats.hardSolved}/${solvedStats.hardTotal}`}

                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              SUBMISSION HEATMAP
          ================================================= */}

          <div className="ud-card">

            <div className="ud-heatmap-header">

              <div className="ud-heatmap-title">

                <b>
                  {heatmapLoading
                    ? "—"
                    : heatmap.totalSubmissions}
                </b>

                {" "}submissions in the past one year

              </div>


              <div className="ud-heatmap-meta">

                <span>
                  Total active days:{" "}
                  {heatmapLoading
                    ? "—"
                    : heatmap.activeDays}
                </span>

                <span>
                  Max streak:{" "}
                  {heatmapLoading
                    ? "—"
                    : heatmap.maxStreak}
                </span>

                {/* -------------------------------------------
                    Year picker
                ------------------------------------------- */}

                <div className="ud-year-picker">

                  <button
                    className="ud-year-btn"
                    onClick={() =>
                      setYearMenuOpen((open) => !open)
                    }
                  >
                    {heatmapRange === "current"
                      ? "Current"
                      : heatmapRange}
                    <ChevronDown size={13} />
                  </button>

                  {yearMenuOpen && (

                    <div className="ud-year-menu">

                      <div
                        className={`ud-year-option ${
                          heatmapRange === "current"
                            ? "ud-year-option-active"
                            : ""
                        }`}
                        onClick={() =>
                          selectHeatmapRange("current")
                        }
                      >
                        Current
                        {heatmapRange === "current" && (
                          <Check size={12} />
                        )}
                      </div>

                      {yearOptions.map((year) => (

                        <div
                          key={year}
                          className={`ud-year-option ${
                            heatmapRange === year
                              ? "ud-year-option-active"
                              : ""
                          }`}
                          onClick={() =>
                            selectHeatmapRange(year)
                          }
                        >
                          {year}
                          {heatmapRange === year && (
                            <Check size={12} />
                          )}
                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div>

            </div>


            {heatmapLoading ? (

              <div className="ud-heatmap-empty">
                Loading activity…
              </div>

            ) : heatmapWeeks.length === 0 ? (

              <div className="ud-heatmap-empty">
                No submissions in this period yet.
                Solve a problem to start your streak!
              </div>

            ) : (

              <div className="ud-heatmap-scroll">

                <div
                  className="ud-heatmap-inner"
                  style={{
                    width: heatmapWeeks.length * WEEK_COLUMN_WIDTH,
                  }}
                >

                  {/* Month labels — real, derived from submission dates */}

                  <div className="ud-heatmap-months">

                    {monthTicks.map((tick) => (

                      <span
                        key={tick.weekIndex}
                        className="ud-heatmap-month-label"
                        style={{
                          width: tick.span * WEEK_COLUMN_WIDTH,
                        }}
                      >
                        {tick.label}
                      </span>

                    ))}

                  </div>


                  <div className="ud-heatmap-body">

                    {/* Weekday labels down the left */}

                    


                    <div className="ud-heatmap-grid">

                      {heatmapWeeks.map(
                        (week, wi) => (

                          <React.Fragment key={wi}>

                            {week.map(
                              (day, di) => (

                                <div
                                  key={di}
                                  className={heatColor(
                                    day?.count
                                  )}
                                  title={
                                    day?.date
                                      ? `${day.count || 0} submissions on ${day.date}`
                                      : "No data"
                                  }
                                />

                              )
                            )}

                          </React.Fragment>

                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              RECENT SUBMISSIONS
          ================================================= */}

          <div className="ud-card">

            <div className="ud-tabs-row">

              {TABS.map((tab) => {

                const Icon = tab.icon;

                return (

                  <button
                    key={tab.key}
                    className={`ud-tab ${
                      activeTab === tab.key
                        ? "ud-tab-active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveTab(tab.key)
                    }
                  >

                    <Icon size={14} />

                    {tab.label}

                  </button>

                );

              })}


              <div className="ud-tabs-spacer" />


              <span className="ud-view-all">

                View all submissions

                <ChevronRight size={13} />

              </span>

            </div>


            {submissionsLoading ? (

              <div className="ud-list-empty">
                Loading…
              </div>

            ) : submissions.length === 0 ? (

              <div className="ud-list-empty">
                Nothing here yet.
              </div>

            ) : (

              submissions.map((submission) => (

                <div
                  className="ud-submission-row"
                  key={submission.submissionId}
                >

                  <span className="ud-submission-title">

                    {submission.problemTitle}

                  </span>


                  <span className="ud-submission-time">

                    {submission.submittedAt}

                  </span>

                </div>

              ))

            )}

          </div>

        </main>

      </div>

    </div>
  );
}