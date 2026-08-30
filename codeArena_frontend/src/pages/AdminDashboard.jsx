import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Ban,
  ShieldCheck,
  History,
  ShieldOff,
  ListChecks,
  FileWarning,
  UserCheck,
  Trophy,
  LogOut,
} from "lucide-react";
import api from "../services/axios";
import "../styles/AdminDashboard.css";

// ---------------------------------------------------------------------------
// Admin dashboard. Everything here talks to a Spring Boot admin API:
//   GET    /api/admin/stats                       -> { totalProblems, totalUsers, totalSubmissions, activeToday }
//   GET    /api/admin/problems                     -> [{ id, title, difficulty, tags[], status }]
//   POST   /api/admin/problems                      -> create
//   PUT    /api/admin/problems/:id                   -> update
//   DELETE /api/admin/problems/:id                   -> delete
//   GET    /api/admin/problems/:id/testcases         -> [{ id, input, output }]
//   POST   /api/admin/problems/:id/testcases          -> create test case
//   DELETE /api/admin/testcases/:id                    -> delete test case
//   GET    /api/admin/users                          -> [{ id, name, email, role, status, joinedAt }]
//   PATCH  /api/admin/users/:id                        -> { role } or { status }
//
// Until that backend exists, every list starts empty and every write is a
// no-op that just updates local state so you can see the UI working.
// ---------------------------------------------------------------------------

async function apiFetch(
  endpoint,
  options = {}
) {
  try {

    const {
      body,
      ...rest
    } = options;


    const response = await api({
      url: endpoint,

      ...rest,

      ...(body !== undefined && {
        data: body,
      }),
    });


    return {
      ok: true,
      data: response.data,
    };

  } catch (error) {

    return {
      ok: false,

      data:
        error.response?.data ||
        {
          message:
            "Request failed",
        },
    };
  }
}

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const EMPTY_PROBLEM_FORM = {
  title: "",
  description: "",
  difficulty: "EASY",
  topic: "",
  starterCodeJava: "",
  starterCodePython: "",
  starterCodeCpp: "",
  starterCodeJavascript: "",
  editorial: "",
  hints: "",
  editorialUnlockAttempts: 3
};
const EMPTY_TC_FORM = { input: "", output: "" };

function diffBadgeClass(diff) {
  if (diff === "Easy") return "ad-badge-easy";
  if (diff === "Hard") return "ad-badge-hard";
  return "ad-badge-med";
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  if (!message) return null;
  return <div className="ad-toast">{message}</div>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("overview");
  const [toast, setToast] = useState("");

  // ---------------- Stats ----------------
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const { ok, data } = await apiFetch("/admin/stats");
    setStats(ok ? data : { totalProblems: 0, totalUsers: 0, totalSubmissions: 0, activeToday: 0 });
    setStatsLoading(false);
  }, []);
  useEffect(() => {
  loadStats();
}, [loadStats]);

  // ---------------- Problems ----------------
  const [problems, setProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [problemsError, setProblemsError] = useState(null);
  const [problemQuery, setProblemQuery] = useState("");

  const loadProblems = useCallback(async () => {
    setProblemsLoading(true);
    setProblemsError(null);
    const { ok, data } = await apiFetch("/problems");
    setProblems(ok && Array.isArray(data) ? data : []);
    setProblemsLoading(false);
  }, []);

  const filteredProblems = useMemo(() => {
    if (!problemQuery.trim()) return problems;
    const q = problemQuery.toLowerCase();
    return problems.filter((p) => p.title.toLowerCase().includes(q) || String(p.id).includes(q));
  }, [problems, problemQuery]);

  // ---------------- Users ----------------
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [userQuery, setUserQuery] = useState("");

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    const { ok, data } = await apiFetch("/api/admin/users");
    setUsers(ok && Array.isArray(data) ? data : []);
    setUsersLoading(false);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!userQuery.trim()) return users;
    const q = userQuery.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userQuery]);

  // ---------------- Submissions ----------------
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState("");

  const loadSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    setSubmissionsError("");

    const { ok, data } = await apiFetch("/submissions/admin");

    if (ok && Array.isArray(data)) {
      setSubmissions(data);
    } else {
      setSubmissions([]);
      setSubmissionsError(
        data?.message || "Failed to load submissions."
      );
    }

    setSubmissionsLoading(false);
  }, []);

  // ---------------- Leaderboard ----------------
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError("");

    const { ok, data } = await apiFetch("/leaderboard/global");

    if (ok && Array.isArray(data)) {
      setLeaderboard(data);
    } else {
      setLeaderboard([]);
      setLeaderboardError(
        data?.message || "Failed to load leaderboard."
      );
    }

    setLeaderboardLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    loadProblems();
    loadUsers();
  }, [loadStats, loadProblems, loadUsers]);

  useEffect(() => {
    if (section === "submissions") {
      loadSubmissions();
    }

    if (section === "leaderboard") {
      loadLeaderboard();
    }
  }, [section, loadSubmissions, loadLeaderboard]);

  // ---------------- Problem modal (add / edit) ----------------
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [problemForm, setProblemForm] = useState(EMPTY_PROBLEM_FORM);
  const [problemFormError, setProblemFormError] = useState("");

  function openAddProblem() {
    setEditingProblemId(null);
    setProblemForm(EMPTY_PROBLEM_FORM);
    setProblemFormError("");
    setProblemModalOpen(true);
  }

  function openEditProblem(p) {
  setEditingProblemId(p.id);

  setProblemForm({
    title: p.title || "",
    description: p.description || "",
    difficulty: p.difficulty || "EASY",
    topic: p.topic || "",
    starterCodeJava: p.starterCodeJava || "",
    starterCodePython: p.starterCodePython || "",
    starterCodeCpp: p.starterCodeCpp || "",
    starterCodeJavascript: p.starterCodeJavascript || "",
    editorial: p.editorial || "",
    hints: p.hints || "",
    editorialUnlockAttempts:
      p.editorialUnlockAttempts ?? 3,
  });

  setProblemFormError("");
  setProblemModalOpen(true);
}

  async function saveProblem() {

  if (!problemForm.title.trim()) {
    setProblemFormError("Title is required.");
    return;
  }

  if (!problemForm.description.trim()) {
    setProblemFormError("Description is required.");
    return;
  }

  if (!problemForm.topic.trim()) {
    setProblemFormError("Topic is required.");
    return;
  }

  const payload = {
    title: problemForm.title.trim(),

    description:
      problemForm.description.trim(),

    difficulty:
      problemForm.difficulty,

    topic:
      problemForm.topic.trim(),

    starterCodeJava:
      problemForm.starterCodeJava,

    starterCodePython:
      problemForm.starterCodePython,

    starterCodeCpp:
      problemForm.starterCodeCpp,

    starterCodeJavascript:
      problemForm.starterCodeJavascript,

    editorial:
      problemForm.editorial,

    hints:
      problemForm.hints,

    editorialUnlockAttempts:
      Number(
        problemForm.editorialUnlockAttempts
      ),
  };


  // =========================
  // UPDATE
  // =========================

  if (editingProblemId) {

    const {
      ok,
      data,
    } = await apiFetch(
      `/problems/${editingProblemId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(payload),
      }
    );


    if (!ok) {

      setProblemFormError(
        data?.message ||
        "Failed to update problem."
      );

      return;
    }


    setProblems((previous) =>
      previous.map((problem) =>
        problem.id === editingProblemId
          ? data
          : problem
      )
    );


    setToast(
      "Problem updated successfully"
    );

  }

  // =========================
  // CREATE
  // =========================

  else {

    const {
      ok,
      data,
    } = await apiFetch(
      "/problems",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(payload),
      }
    );


    if (!ok) {

      setProblemFormError(
        data?.message ||
        "Failed to create problem."
      );

      return;
    }


    // IMPORTANT:
    // Add only the actual database response.
    setProblems((previous) => [
      data,
      ...previous,
    ]);


    setToast(
      "Problem created successfully"
    );
  }


  setProblemModalOpen(false);
}
  async function deleteProblem(p) {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    await apiFetch(`/problems/${p.id}`, { method: "DELETE" });
    setProblems((prev) => prev.filter((x) => x.id !== p.id));
    setToast("Problem deleted");
  }

  // ---------------- Test case modal ----------------
  const [tcModalOpen, setTcModalOpen] = useState(false);
  const [tcProblem, setTcProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [tcForm, setTcForm] = useState(EMPTY_TC_FORM);
  const [tcFormError, setTcFormError] = useState("");

 async function openTestCases(p) {
  setTcProblem(p);
  setTcModalOpen(true);
  setTcForm(EMPTY_TC_FORM);
  setTcFormError("");
  setTcLoading(true);

  const { ok, data } =
    await apiFetch(
      `/test-cases/problem/${p.id}`
    );

  setTestCases(
    ok && Array.isArray(data)
      ? data
      : []
  );

  setTcLoading(false);
}

  async function addTestCase() {
  if (!tcForm.input.trim() || !tcForm.output.trim()) {
    setTcFormError(
      "Both input and expected output are required."
    );
    return;
  }

  const payload = {
    problemId: tcProblem.id,
    input: tcForm.input,
    expectedOutput: tcForm.output,
    hidden: false,
    timeLimitMs: 5000,
  };

  const { ok, data } = await apiFetch(
    "/test-cases",
    {
      method: "POST",
      data: payload,
    }
  );

  if (!ok) {
    setTcFormError(
      data?.message || "Request failed"
    );
    return;
  }

  setTestCases((prev) => [
    ...prev,
    data
  ]);

  setTcForm(EMPTY_TC_FORM);
  setTcFormError("");
}

  async function deleteTestCase(id) {
  const { ok, data } = await apiFetch(
    `/test-cases/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!ok) {
    setTcFormError(
      data?.message ||
      "Failed to delete test case."
    );
    return;
  }

  setTestCases((prev) =>
    prev.filter((t) => t.id !== id)
  );
}

  // ---------------- User actions ----------------
  async function toggleUserRole(u) {
    const nextRole = u.role === "admin" ? "user" : "admin";
    await apiFetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
    setToast(nextRole === "admin" ? `${u.name} promoted to admin` : `${u.name} demoted to user`);
  }

  async function toggleUserStatus(u) {
    const nextStatus = u.status === "banned" ? "active" : "banned";
    await apiFetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: nextStatus } : x)));
    setToast(nextStatus === "banned" ? `${u.name} banned` : `${u.name} unbanned`);
  }

  return (
    <div className="ad-app">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo">
          <span className="ad-sidebar-logo-icon">⌂</span> Admin Panel
        </div>
        <button
          className={`ad-nav-item ${section === "overview" ? "ad-nav-item-active" : ""}`}
          onClick={() => setSection("overview")}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
        <button
          className={`ad-nav-item ${section === "problems" ? "ad-nav-item-active" : ""}`}
          onClick={() => setSection("problems")}
        >
          <FileText size={16} /> Problems
        </button>
        <button
          className={`ad-nav-item ${section === "users" ? "ad-nav-item-active" : ""}`}
          onClick={() => setSection("users")}
        >
          <Users size={16} /> Users
        </button>

        <button
          className={`ad-nav-item ${section === "submissions" ? "ad-nav-item-active" : ""}`}
          onClick={() => setSection("submissions")}
        >
          <History size={16} /> Submissions
        </button>

        <button
          className={`ad-nav-item ${section === "leaderboard" ? "ad-nav-item-active" : ""}`}
          onClick={() => setSection("leaderboard")}
        >
          <Trophy size={16} /> Leaderboard
        </button>

        <button
          className="ad-nav-item ad-logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            navigate("/login");
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* ---------------- Main ---------------- */}
      <main className="ad-main">
        {section === "overview" && (
          <>
            <div className="ad-header">
              <div>
                <h1 className="ad-title">Overview</h1>
                <div className="ad-subtitle">Platform activity at a glance</div>
              </div>
            </div>
            <div className="ad-stats-grid">
              <div className="ad-stat-card">
                <FileText className="ad-stat-icon" size={18} />
                <div className="ad-stat-label">Total problems</div>
                <div className="ad-stat-value">{statsLoading ? "—" : stats.totalProblems}</div>
              </div>
              <div className="ad-stat-card">
                <Users className="ad-stat-icon" size={18} />
                <div className="ad-stat-label">Total users</div>
                <div className="ad-stat-value">{statsLoading ? "—" : stats.totalUsers}</div>
              </div>
              <div className="ad-stat-card">
                <ListChecks className="ad-stat-icon" size={18} />
                <div className="ad-stat-label">Total submissions</div>
                <div className="ad-stat-value">{statsLoading ? "—" : stats.totalSubmissions}</div>
              </div>
              <div className="ad-stat-card">
                <UserCheck className="ad-stat-icon" size={18} />
                <div className="ad-stat-label">Active today</div>
                <div className="ad-stat-value">{statsLoading ? "—" : stats.activeToday}</div>
              </div>
            </div>
            {!statsLoading && stats.totalProblems === 0 && stats.totalUsers === 0 && (
              <div className="ad-table-empty">
                <FileWarning size={22} style={{ marginBottom: 8, color: "#7a7a7a" }} />
                <div className="ad-table-empty-title">No data yet</div>
                <div className="ad-table-empty-sub">
                  Stats will populate once your backend is connected and problems/users exist.
                </div>
              </div>
            )}
          </>
        )}

        {section === "problems" && (
          <>
            <div className="ad-header">
              <div>
                <h1 className="ad-title">Problems</h1>
                <div className="ad-subtitle">Create and manage the problem catalog</div>
              </div>
              <button className="ad-btn ad-btn-primary" onClick={openAddProblem}>
                <Plus size={16} /> Add problem
              </button>
            </div>

            <div className="ad-controls">
              <div className="ad-search-box">
                <Search size={14} className="ad-icon-muted" />
                <input
                  value={problemQuery}
                  onChange={(e) => setProblemQuery(e.target.value)}
                  placeholder="Search problems"
                />
              </div>
            </div>

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {problemsLoading && (
                    <tr>
                      <td colSpan={5} className="ad-table-empty">Loading problems…</td>
                    </tr>
                  )}
                  {!problemsLoading && problemsError && (
                    <tr>
                      <td colSpan={5} className="ad-table-error">{problemsError}</td>
                    </tr>
                  )}
                  {!problemsLoading && !problemsError && problems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="ad-table-empty">
                        <div className="ad-table-empty-title">No problems yet</div>
                        <div className="ad-table-empty-sub">Click "Add problem" to create the first one.</div>
                      </td>
                    </tr>
                  )}
                  {!problemsLoading &&
                    !problemsError &&
                    problems.length > 0 &&
                    filteredProblems.map((p) => (
                      <tr key={p.id}>
                        <td className="ad-td-title">{p.title}</td>
                        <td>
                          <span className={`ad-badge ${diffBadgeClass(p.difficulty)}`}>{p.difficulty}</span>
                        </td>
                        <td>
                          <span className="ad-tag-pill">
                          {p.topic || "—"}
                          </span>
                        </td>

                         <td className="ad-td-muted">
                              #{p.id}
                        </td>

                          < td>

                          <div className="ad-row-actions">
                            <button className="ad-icon-btn" title="Manage test cases" onClick={() => openTestCases(p)}>
                              <ListChecks size={14} />
                            </button>
                            <button className="ad-icon-btn" title="Edit" onClick={() => openEditProblem(p)}>
                              <Pencil size={14} />
                            </button>
                            <button
                              className="ad-icon-btn ad-icon-btn-danger"
                              title="Delete"
                              onClick={() => deleteProblem(p)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {!problemsLoading && !problemsError && problems.length > 0 && filteredProblems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="ad-table-empty">No problems match your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "users" && (
          <>
            <div className="ad-header">
              <div>
                <h1 className="ad-title">Users</h1>
                <div className="ad-subtitle">Manage roles and account status</div>
              </div>
            </div>

            <div className="ad-controls">
              <div className="ad-search-box">
                <Search size={14} className="ad-icon-muted" />
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search users by name or email"
                />
              </div>
            </div>

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && (
                    <tr>
                      <td colSpan={5} className="ad-table-empty">Loading users…</td>
                    </tr>
                  )}
                  {!usersLoading && usersError && (
                    <tr>
                      <td colSpan={5} className="ad-table-error">{usersError}</td>
                    </tr>
                  )}
                  {!usersLoading && !usersError && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="ad-table-empty">
                        <div className="ad-table-empty-title">No users yet</div>
                        <div className="ad-table-empty-sub">Registered users will show up here.</div>
                      </td>
                    </tr>
                  )}
                  {!usersLoading &&
                    !usersError &&
                    users.length > 0 &&
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="ad-td-title">{u.name}</td>
                        <td className="ad-td-muted">{u.email}</td>
                        <td>
                          <span className={`ad-badge ${u.role === "admin" ? "ad-badge-admin" : "ad-badge-user"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`ad-badge ${u.status === "banned" ? "ad-badge-banned" : "ad-badge-active"}`}>
                            {u.status || "active"}
                          </span>
                        </td>
                        <td>
                          <div className="ad-row-actions">
                            <button
                              className="ad-icon-btn"
                              title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                              onClick={() => toggleUserRole(u)}
                            >
                              {u.role === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                            </button>
                            <button
                              className="ad-icon-btn ad-icon-btn-danger"
                              title={u.status === "banned" ? "Unban" : "Ban"}
                              onClick={() => toggleUserStatus(u)}
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {!usersLoading && !usersError && users.length > 0 && filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="ad-table-empty">No users match your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "submissions" && (
          <>
            <div className="ad-header">
              <div>
                <h1 className="ad-title">Submissions</h1>
                <div className="ad-subtitle">
                  All platform submissions
                </div>
              </div>

              <button
                className="ad-btn ad-btn-secondary"
                onClick={loadSubmissions}
                disabled={submissionsLoading}
              >
                {submissionsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {submissionsError && (
              <div className="ad-table-error">
                {submissionsError}
              </div>
            )}

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Problem</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Runtime</th>
                    <th>Memory</th>
                    <th>Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {submissionsLoading && (
                    <tr>
                      <td colSpan={8} className="ad-table-empty">
                        Loading submissions…
                      </td>
                    </tr>
                  )}

                  {!submissionsLoading &&
                    !submissionsError &&
                    submissions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="ad-table-empty">
                          <div className="ad-table-empty-title">
                            No submissions yet
                          </div>
                          <div className="ad-table-empty-sub">
                            User submissions will appear here.
                          </div>
                        </td>
                      </tr>
                    )}

                  {!submissionsLoading &&
                    !submissionsError &&
                    submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="ad-td-title">
                          #{submission.id}
                        </td>

                        <td>
                          User #{submission.userId}
                        </td>

                        <td>
                          Problem #{submission.problemId}
                        </td>

                        <td>
                          {submission.language}
                        </td>

                        <td>
                          <span
                            className={`ad-submission-status ${String(
                              submission.status || ""
                            )
                              .toLowerCase()
                              .replaceAll("_", "-")}`}
                          >
                            {submission.status || "—"}
                          </span>
                        </td>

                        <td>
                          {submission.executionTimeMs != null
                            ? `${submission.executionTimeMs} ms`
                            : "—"}
                        </td>

                        <td>
                          {submission.memoryUsedKb != null
                            ? `${submission.memoryUsedKb} KB`
                            : "—"}
                        </td>

                        <td className="ad-td-muted">
                          {submission.createdAt
                            ? new Date(
                                submission.createdAt
                              ).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "leaderboard" && (
          <>
            <div className="ad-header">
              <div>
                <h1 className="ad-title">Leaderboard</h1>
                <div className="ad-subtitle">
                  Global platform rankings
                </div>
              </div>

              <button
                className="ad-btn ad-btn-secondary"
                onClick={loadLeaderboard}
                disabled={leaderboardLoading}
              >
                {leaderboardLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {leaderboardError && (
              <div className="ad-table-error">
                {leaderboardError}
              </div>
            )}

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Problems Solved</th>
                    <th>Total Score</th>
                    <th>Acceptance Rate</th>
                    <th>Fastest Submission</th>
                  </tr>
                </thead>

                <tbody>
                  {leaderboardLoading && (
                    <tr>
                      <td colSpan={6} className="ad-table-empty">
                        Loading leaderboard…
                      </td>
                    </tr>
                  )}

                  {!leaderboardLoading &&
                    !leaderboardError &&
                    leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className="ad-table-empty">
                          <div className="ad-table-empty-title">
                            No leaderboard data
                          </div>
                          <div className="ad-table-empty-sub">
                            Users will appear here after solving problems.
                          </div>
                        </td>
                      </tr>
                    )}

                  {!leaderboardLoading &&
                    !leaderboardError &&
                    leaderboard.map((entry) => (
                      <tr key={entry.userId}>
                        <td className="ad-td-title">
                          #{entry.rank}
                        </td>

                        <td className="ad-td-title">
                          {entry.username}
                        </td>

                        <td>
                          {entry.problemsSolved}
                        </td>

                        <td>
                          {entry.totalScore}
                        </td>

                        <td>
                          {Number(entry.acceptanceRate).toFixed(2)}%
                        </td>

                        <td className="ad-td-muted">
                          {entry.fastestSubmissionTimeMs !== null &&
                          entry.fastestSubmissionTimeMs !== undefined
                            ? `${entry.fastestSubmissionTimeMs} ms`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ---------------- Add / edit problem modal ---------------- */}
      {problemModalOpen && (
        <div className="ad-modal-overlay" onClick={() => setProblemModalOpen(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2 className="ad-modal-title">{editingProblemId ? "Edit problem" : "Add problem"}</h2>
              <button className="ad-modal-close" onClick={() => setProblemModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="ad-field">
              <label className="ad-label">Title</label>
              <input
                className="ad-input"
                value={problemForm.title}
                onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                placeholder="e.g. Two Sum"
              />
            </div>

            <div className="ad-field-row">
              <div className="ad-field">
                <label className="ad-label">Difficulty</label>
                <select
                  className="ad-select"
                  value={problemForm.difficulty}
                  onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="ad-field">
                <label className="ad-label">Tags (comma separated)</label>
                <input
                  className="ad-input"
                  value={problemForm.tags}
                  onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
                  placeholder="Array, Hash Table"
                />
              </div>
            </div>

            <div className="ad-field">
              <label className="ad-label">Description</label>
              <textarea
                className="ad-textarea"
                value={problemForm.description}
                onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                placeholder="Problem statement shown to the user"
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">Constraints</label>
              <textarea
                className="ad-textarea"
                value={problemForm.constraints}
                onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
                placeholder="e.g. 1 <= n <= 10^5"
              />
            </div>
            <div className="ad-field">
              <label className="ad-label">
                Topic
              </label>

           <input
             className="ad-input"
             value={problemForm.topic}
             onChange={(e) =>
               setProblemForm({
               ...problemForm,
               topic: e.target.value
              })
            }
            placeholder="e.g. Arrays"
             />
           </div>
            <div className="ad-field">
              <label className="ad-label">
               Java Starter Code
             </label>

            <textarea
                className="ad-textarea"
                value={problemForm.starterCodeJava}
                onChange={(e) =>
                setProblemForm({
                ...problemForm,
                starterCodeJava: e.target.value
             })
             }
            placeholder="Enter Java starter code"
          />
        </div>
        <div className="ad-field">
  <label className="ad-label">
    Python Starter Code
  </label>

  <textarea
    className="ad-textarea"
    value={problemForm.starterCodePython}
    onChange={(e) =>
      setProblemForm({
        ...problemForm,
        starterCodePython: e.target.value
      })
    }
    placeholder="Enter Python starter code"
  />
</div>
<div className="ad-field">
  <label className="ad-label">
    C++ Starter Code
  </label>

  <textarea
    className="ad-textarea"
    value={problemForm.starterCodeCpp}
    onChange={(e) =>
      setProblemForm({
        ...problemForm,
        starterCodeCpp: e.target.value
      })
    }
    placeholder="Enter C++ starter code"
  />
</div>
<div className="ad-field">
  <label className="ad-label">
    JavaScript Starter Code
  </label>

  <textarea
    className="ad-textarea"
    value={problemForm.starterCodeJavascript}
    onChange={(e) =>
      setProblemForm({
        ...problemForm,
        starterCodeJavascript: e.target.value
      })
    }
    placeholder="Enter JavaScript starter code"
  />
</div>
<div className="ad-field">
  <label className="ad-label">
    Editorial
  </label>

  <textarea
    className="ad-textarea"
    value={problemForm.editorial}
    onChange={(e) =>
      setProblemForm({
        ...problemForm,
        editorial: e.target.value
      })
    }
    placeholder="Enter editorial"
  />
</div>
<div className="ad-field">
  <label className="ad-label">
    Hints
  </label>

  <textarea
    className="ad-textarea"
    value={problemForm.hints}
    onChange={(e) =>
      setProblemForm({
        ...problemForm,
        hints: e.target.value
      })
    }
    placeholder="Enter hints"
  />
</div>
<div className="ad-field">
  <label className="ad-label">
    Editorial Unlock Attempts
  </label>

  <input
    type="number"
    min="1"
    className="ad-input"
    value={problemForm.editorialUnlockAttempts}
    onChange={(e) =>
      setProblemForm({
        ...problemForm,
        editorialUnlockAttempts: e.target.value
      })
    }
  />
</div>


            {problemFormError && <div className="ad-field-error">{problemFormError}</div>}

            <div className="ad-modal-footer">
              <button className="ad-btn ad-btn-secondary" onClick={() => setProblemModalOpen(false)}>Cancel</button>
              <button className="ad-btn ad-btn-primary" onClick={saveProblem}>
                {editingProblemId ? "Save changes" : "Create problem"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Test cases modal ---------------- */}
      {tcModalOpen && (
        <div className="ad-modal-overlay" onClick={() => setTcModalOpen(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2 className="ad-modal-title">Test cases — {tcProblem?.title}</h2>
              <button className="ad-modal-close" onClick={() => setTcModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {tcLoading ? (
              <div className="ad-table-empty">Loading test cases…</div>
            ) : (
              <div className="ad-tc-list">
                {testCases.length === 0 && (
                  <div className="ad-tc-empty">No test cases yet. Add the first one below.</div>
                )}
                {testCases.map((tc) => (
                  <div className="ad-tc-item" key={tc.id}>
                    <div className="ad-tc-item-body">
                      <div className="ad-tc-item-label">Input</div>
                      <div className="ad-tc-item-value">{tc.input}</div>
                      <div className="ad-tc-item-label" style={{ marginTop: 6 }}>Expected output</div>
                      <div className="ad-tc-item-value">{tc.output}</div>
                    </div>
                    <button className="ad-icon-btn ad-icon-btn-danger" onClick={() => deleteTestCase(tc.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="ad-field">
              <label className="ad-label">Input</label>
              <textarea
                className="ad-textarea"
                value={tcForm.input}
                onChange={(e) => setTcForm({ ...tcForm, input: e.target.value })}
                placeholder="nums = [2,7,11,15], target = 9"
              />
            </div>
            <div className="ad-field">
              <label className="ad-label">Expected output</label>
              <textarea
                className="ad-textarea"
                value={tcForm.output}
                onChange={(e) => setTcForm({ ...tcForm, output: e.target.value })}
                placeholder="[0,1]"
              />
            </div>
            {tcFormError && <div className="ad-field-error">{tcFormError}</div>}

            <div className="ad-modal-footer">
              <button className="ad-btn ad-btn-secondary" onClick={() => setTcModalOpen(false)}>Done</button>
              <button className="ad-btn ad-btn-primary" onClick={addTestCase}>
                <Plus size={14} /> Add test case
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}