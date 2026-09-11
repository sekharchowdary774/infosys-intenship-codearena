import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shuffle,
  Play,
  UploadCloud,
  Bell,
  Coins,
  FileText,
  BookOpen,
  MessageSquare,
  History,
  Tag,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Star,
  Share2,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import "../styles/ProblemSolvePage.css";
import api from "../services/axios";
// ---------------------------------------------------------------------------
// Problem solving page. Nothing about the problem itself is hardcoded — it's
// all fetched from your Spring Boot backend. Starter code and test cases come
// entirely from the DB — there is no local fallback template.
// ---------------------------------------------------------------------------

// Only the first 3 test cases are ever shown to the user (in the Testcase
// tab and when Running) — matches typical judge platforms that show a
// handful of sample cases publicly and keep the rest hidden for scoring.
// Submit still scores against whatever your backend judges server-side,
// independent of this frontend cap.
const MAX_VISIBLE_CASES = 3;

const LANGUAGES = [
  { key: "cpp", label: "C++", monacoId: "cpp" },
  { key: "java", label: "Java", monacoId: "java" },
  { key: "python", label: "Python", monacoId: "python" },
  { key: "javascript", label: "JavaScript", monacoId: "javascript" },
];

const LEFT_TABS = [
  { key: "description", label: "Description", icon: FileText },
  { key: "editorial", label: "Editorial", icon: BookOpen },
  { key: "submissions", label: "Submissions", icon: History },
];

async function apiFetch(url, options = {}) {
  try {
    const response = await api({
      url,
      method: options.method || "GET",
      headers: options.headers,
      data: options.body ? JSON.parse(options.body) : undefined,
    });

    return { ok: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { ok: false, data: error.response?.data || null };
  }
}

// Splits a raw testcase input string like `s = "abc,def", nums = [1,2,3], k = 3`
// into [{ key: "s", value: '"abc,def"' }, { key: "nums", value: "[1,2,3]" }, ...]
// respecting nesting inside quotes/brackets so commas inside them aren't split on.
function parseParams(input) {
  if (!input) return [];
  const parts = [];
  let depth = 0;
  let inQuote = false;
  let current = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"' && input[i - 1] !== "\\") inQuote = !inQuote;
    if (!inQuote) {
      if ("[({".includes(ch)) depth++;
      if ("])}".includes(ch)) depth--;
    }
    if (ch === "," && depth === 0 && !inQuote) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  return parts.map((p) => {
    const eq = p.indexOf("=");
    if (eq === -1) return { key: "", value: p.trim() };
    return { key: p.slice(0, eq).trim(), value: p.slice(eq + 1).trim() };
  });
}

// Judge-style comparison: ignore all whitespace differences (spaces after
// commas, trailing newlines, etc.) so "[1, 2]" and "[1,2]" are treated as
// the same answer. Structural characters (brackets, commas, digits) still
// have to match — only whitespace is ignored.
function normalizeOutput(value) {
  return (value ?? "").replace(/\s+/g, "");
}
function parseExamples(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "object") {
    return [value];
  }

  if (typeof value !== "string") {
    return [];
  }

  const text = value.trim();

  if (!text) return [];

  // Try JSON first
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }

    if (parsed && typeof parsed === "object") {
      return [parsed];
    }
  } catch (error) {
    // Not JSON — continue with text parsing
  }

  // Supports:
  //
  // Example 1:
  // Input: nums = [2,7,11,15], target = 9
  // Output: [0,1]
  // Explanation: nums[0] + nums[1] = 9
  //
  // Example 2:
  // Input: nums = [3,2,4], target = 6
  // Output: [1,2]
  // Explanation: nums[1] + nums[2] = 6

  const exampleBlocks = text
    .split(/(?=Example\s*\d+\s*:)/i)
    .map((block) => block.trim())
    .filter(Boolean);

  const examples = [];

  for (const block of exampleBlocks) {
    const inputMatch = block.match(
      /Input\s*:\s*([\s\S]*?)(?=\n\s*Output\s*:|$)/i
    );

    const outputMatch = block.match(
      /Output\s*:\s*([\s\S]*?)(?=\n\s*Explanation\s*:|$)/i
    );

    const explanationMatch = block.match(
      /Explanation\s*:\s*([\s\S]*)/i
    );

    examples.push({
      input: inputMatch ? inputMatch[1].trim() : "",
      output: outputMatch ? outputMatch[1].trim() : "",
      explanation: explanationMatch
        ? explanationMatch[1].trim()
        : "",
    });
  }

  return examples;
}

export default function ProblemSolvePage() {
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorial, setEditorial] = useState(null);
const [editorialLoading, setEditorialLoading] = useState(false);

  const [leftTab, setLeftTab] = useState("description");
  const [openMeta, setOpenMeta] = useState(null);

  const [language, setLanguage] = useState("java");
  const [codeByLang, setCodeByLang] = useState({});

  const [bottomTab, setBottomTab] = useState("testcase");
  const [cases, setCases] = useState([]);
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [caseValues, setCaseValues] = useState({});

  // Which case's detail is shown in the Test Result tab. Separate from
  // activeCaseIdx (the Testcase tab's selection) because Run now evaluates
  // every visible case at once, and the result view defaults to the first
  // failing case rather than whatever was selected before running.
  const [resultCaseIdx, setResultCaseIdx] = useState(0);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [judgeUnavailable, setJudgeUnavailable] = useState(false);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!problemId) return;

    let cancelled = false;

    async function fetchProblem() {
      setLoading(true);
      setError(null);

      try {
        const problemResponse = await api.get(`/problems/${problemId}`);
        const data = problemResponse.data;

        const formattedProblem = {
          id: data.id,
          title: data.title || "",
          description: data.description || "",
          difficulty: data.difficulty || "Easy",
          topics: data.topic
            ? data.topic.split(",").map((topic) => topic.trim()).filter(Boolean)
            : [],
          // Hints: backend may send an array (data.hints = ["...", "..."]),
          // or a single string with hints separated by newlines. Either
          // way, this always ends up as an array so "Hint 1", "Hint 2"...
          // render dynamically instead of a fixed count.
          hints: Array.isArray(data.hints)
            ? data.hints.filter(Boolean)
            : typeof data.hints === "string" && data.hints.trim()
            ? data.hints.split("\n").map((h) => h.trim()).filter(Boolean)
            : [],
          examples: parseExamples(data.examples),
          constraints: data.constraints || "",
          
          // Only set if the backend actually sends them — left undefined
          // otherwise so the UI hides these sections rather than showing
          // fake/zeroed stats.
          solved: data.solved,
          acceptedCount: data.acceptedCount,
          totalSubmissionCount: data.totalSubmissionCount,
          acceptanceRate: data.acceptanceRate,
          starterCode: {
            cpp: data.starterCodeCpp || "",
            java: data.starterCodeJava || "",
            python: data.starterCodePython || "",
            javascript: data.starterCodeJavascript || "",
          },
          testcases: [],
        };
        
        // Get test cases for THIS problem
        const testCaseResponse = await api.get(`/test-cases/problem/${problemId}`);

        const allTestCases = Array.isArray(testCaseResponse.data)
          ? testCaseResponse.data.map((tc) => ({
              id: tc.id,
              input: tc.input || "",
              output: tc.expectedOutput || "",
              hidden: tc.hidden,
              timeLimitMs: tc.timeLimitMs,
            }))
          : [];

        // Only show the first MAX_VISIBLE_CASES to the user, same as most
        // judge platforms (a few public samples, the rest stay hidden and
        // are scored server-side on Submit).
        const testCases = allTestCases.slice(0, MAX_VISIBLE_CASES);

        formattedProblem.testcases = testCases;

        if (!cancelled) {
          setProblem(formattedProblem);
          setCases(testCases);

          // Starter code comes ONLY from the DB. No fallback template — if a
          // language wasn't filled in via the Admin panel, the editor opens empty.
          setCodeByLang({
            cpp: formattedProblem.starterCode.cpp,
            java: formattedProblem.starterCode.java,
            python: formattedProblem.starterCode.python,
            javascript: formattedProblem.starterCode.javascript,
          });
        }
      } catch (error) {
        console.error("Failed to load problem:", error);

        if (!cancelled) {
          setProblem(null);
          setCases([]);
          setError(error.response?.data?.message || "Couldn't load problem");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProblem();

    return () => {
      cancelled = true;
    };
  }, [problemId]);
  useEffect(() => {
  if (!problemId || leftTab !== "editorial") return;

  let cancelled = false;

  async function fetchEditorial() {
    setEditorialLoading(true);

    try {
      const response = await api.get(
        `/problems/${problemId}/editorial`
      );

      if (!cancelled) {
        setEditorial(response.data);
      }
    } catch (error) {
      console.error("Failed to load editorial:", error);

      if (!cancelled) {
        setEditorial(null);
      }
    } finally {
      if (!cancelled) {
        setEditorialLoading(false);
      }
    }
  }

  fetchEditorial();

  return () => {
    cancelled = true;
  };
}, [problemId, leftTab]);


  const currentCode =
    codeByLang[language] ||
    problem?.starterCode?.[language] ||
    "";

  function updateCode(value) {
    setCodeByLang((prev) => ({ ...prev, [language]: value ?? "" }));
  }

  const activeCase = cases[activeCaseIdx];
  const activeParams = useMemo(() => parseParams(activeCase?.input), [activeCase]);

  function getParamValue(caseIdx, key, fallback) {
    return caseValues[caseIdx]?.[key] ?? fallback;
  }

  function setParamValue(caseIdx, key, value) {
    setCaseValues((prev) => ({
      ...prev,
      [caseIdx]: { ...(prev[caseIdx] || {}), [key]: value },
    }));
  }

  function addCustomCase() {
    if (cases.length >= MAX_VISIBLE_CASES) return;
    setCases((prev) => [...prev, { id: `custom-${Date.now()}`, input: "", output: "", custom: true }]);
    setActiveCaseIdx(cases.length);
    setBottomTab("testcase");
  }

  const handleRun = useCallback(async () => {
    if (!problem) return;

    if (cases.length === 0) return;

    setRunning(true);
    setRunResults(null);
    setSubmitResult(null);
    setJudgeUnavailable(false);
    setBottomTab("result");
    setResultCaseIdx(0);

    // NOTE: this calls /submissions/run once PER case, which means the
    // backend recompiles the same source code for every case (N compiles
    // for N cases — capped at MAX_VISIBLE_CASES so it's at most 3). If this
    // ever feels slow, the real fix is a batch endpoint on the backend that
    // compiles once and runs every case against that single compiled
    // artifact — happy to build that if you want it.
    const results = [];

    for (const c of cases) {
      const { ok, data } = await apiFetch("/submissions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          testCaseId: c.id,
          language: language.toUpperCase(),
          sourceCode: currentCode,
        }),
      });

      if (!ok || !data) {
        setJudgeUnavailable(true);
        setRunning(false);
        return;
      }

      const passed =
        !data.compilationError &&
        !data.timedOut &&
        !data.runtimeError &&
        normalizeOutput(data.output) === normalizeOutput(c.output);

      results.push({
        testcaseId: c.id,
        input: c.input,
        expectedOutput: c.output,
        actualOutput: data.output ?? "",
        passed,
        executionTimeMs: data.executionTimeMs,
        memoryUsedKb: data.memoryUsedKb,
        errorMessage: data.error,
        compilationError: data.compilationError,
        timedOut: data.timedOut,
        runtimeError: data.runtimeError,
      });

      // A compilation error applies identically to every case — no point
      // burning time running the rest against a program that won't build.
      if (data.compilationError) break;
    }

    setRunResults(results);

    // Jump straight to the first failing case, like LeetCode does — if
    // everything passed, just show Case 1.
    const firstFailIdx = results.findIndex((r) => !r.passed);
    setResultCaseIdx(firstFailIdx === -1 ? 0 : firstFailIdx);

    setRunning(false);
  }, [problem, cases, language, currentCode]);

  const refreshEditorial = useCallback(async () => {
    if (!problemId) return;

    try {
      const response = await api.get(
        `/problems/${problemId}/editorial`
      );

      setEditorial(response.data);
    } catch (error) {
      console.error("Failed to refresh editorial:", error);
    }
  }, [problemId]);

  const handleSubmit = useCallback(async () => {
    if (!problem) return;
    setSubmitting(true);
    setSubmitResult(null);
    setJudgeUnavailable(false);
    setBottomTab("result");

    const { ok, data } = await apiFetch("/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        language: language.toUpperCase(),
        sourceCode: currentCode,
      }),
    });

    if (ok && data) {
      setSubmitResult(data);
      await refreshEditorial();
    } else {
      setJudgeUnavailable(true);
    }

    setSubmitting(false);
  }, [problem, language, currentCode, refreshEditorial]);

  return (
    <div className="ps-page">
      {/* ---------------- Top bar ---------------- */}
      <div className="ps-topbar">
        <button className="ps-icon-btn"><ArrowLeft size={16} /></button>
        <div className="ps-topbar-title">
          <List size={15} /> {loading ? "Loading…" : problem?.title || "Untitled problem"}
        </div>
        <button className="ps-icon-btn"><ChevronLeft size={16} /></button>
        <button className="ps-icon-btn"><ChevronRight size={16} /></button>
        <button className="ps-icon-btn"><Shuffle size={15} /></button>

        <div className="ps-topbar-spacer" />

        <button className="ps-run-btn" onClick={handleRun} disabled={running || submitting || loading}>
          {running ? <Loader2 size={14} className="ps-spin" /> : <Play size={14} />} Run
        </button>
        <button className="ps-submit-btn" onClick={handleSubmit} disabled={running || submitting || loading}>
          {submitting ? <Loader2 size={14} className="ps-spin" /> : <UploadCloud size={14} />} Submit
        </button>

        
        
      </div>

      {/* ---------------- Split panels ---------------- */}
      <div className="ps-split">
        {/* ---------------- Left: problem content ---------------- */}
        <div className="ps-left">
          <div className="ps-left-tabs">
            {LEFT_TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`ps-left-tab ${leftTab === t.key ? "ps-left-tab-active" : ""}`}
                  onClick={() => setLeftTab(t.key)}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          <div className="ps-left-content">
            {loading ? (
              <div className="ps-empty-note">Loading problem…</div>
            ) : error ? (
              <div className="ps-empty-note">{error}</div>
            ) : leftTab === "description" ? (
              <>
                <div className="ps-title-row">
                  <h1 className="ps-problem-title">
                    {problem.id}. {problem.title || "Untitled problem"}
                  </h1>
                  {/* Only rendered if the backend actually says this user
                      solved it — never assumed/defaulted to true. */}
                  {problem.solved && (
                    <span className="ps-solved-badge">
                      Solved <CheckCircle2 size={13} />
                    </span>
                  )}
                </div>

                <div className="ps-meta-row">
                  <span className={`ps-diff-badge ps-diff-${(problem.difficulty || "easy").toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                  <button className="ps-meta-pill" onClick={() => setOpenMeta(openMeta === "topics" ? null : "topics")}>
                    <Tag size={12} /> Topics
                  </button>
                </div>

                {openMeta === "topics" && (
                  <div className="ps-meta-dropdown">
                    {(problem.topics || []).length ? problem.topics.map((t) => <span key={t} className="ps-tag-pill">{t}</span>) : <span className="ps-meta-dropdown-empty">No topics tagged.</span>}
                  </div>
                )}

                {(problem.acceptedCount != null || problem.acceptanceRate != null) && (
                  <div className="ps-accept-stats">
                    {problem.acceptedCount != null && problem.totalSubmissionCount != null && (
                      <span>
                        Accepted <b>{problem.acceptedCount.toLocaleString()}</b>/{problem.totalSubmissionCount.toLocaleString()}
                      </span>
                    )}
                    {problem.acceptanceRate != null && (
                      <span>
                        Acceptance Rate <b>{problem.acceptanceRate}%</b>
                      </span>
                    )}
                  </div>
                )}

                {problem.description ? (
                  <div className="ps-description">{problem.description}</div>
                ) : (
                  <div className="ps-empty-note">This problem has no description yet.</div>
                )}

                {(problem.examples || []).map((ex, i) => (
                  <div key={i}>
                    <div className="ps-section-label">Example {i + 1}:</div>
                    <div className="ps-example-block">
                      <div><b>Input:</b> <code>{ex.input}</code></div>
                      <div><b>Output:</b> <code>{ex.output}</code></div>
                      {ex.explanation && <div><b>Explanation:</b> {ex.explanation}</div>}
                    </div>
                  </div>
                ))}

                {problem.constraints && (
                  <>
                    <div className="ps-section-label">Constraints:</div>
                    <div className="ps-constraints">{problem.constraints}</div>
                  </>
                )}

                {problem.hints && problem.hints.length > 0 && (
                  <div className="ps-accordion">
                    {problem.hints.map((hintText, i) => (
                      <div className="ps-accordion-item" key={i}>
                        <button
                          className="ps-accordion-header"
                          onClick={() =>
                            setOpenMeta(openMeta === `hint-${i}` ? null : `hint-${i}`)
                          }
                        >
                          <span>
                            <Lightbulb size={13} /> Hint {i + 1}
                          </span>
                          <ChevronDown
                            size={14}
                            className={openMeta === `hint-${i}` ? "ps-accordion-chevron-open" : ""}
                          />
                        </button>
                        {openMeta === `hint-${i}` && (
                          <div className="ps-accordion-body">{hintText}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* <div className="ps-engage-row">
                  <button
                    className={`ps-engage-btn ${liked ? "ps-engage-btn-active" : ""}`}
                    onClick={() => { setLiked((v) => !v); if (!liked) setDisliked(false); }}
                  >
                    <ThumbsUp size={14} /> {(problem.likes || 0) + (liked ? 1 : 0)}
                  </button>
                  <button
                    className={`ps-engage-btn ${disliked ? "ps-engage-btn-active" : ""}`}
                    onClick={() => { setDisliked((v) => !v); if (!disliked) setLiked(false); }}
                  >
                    <ThumbsDown size={14} /> {(problem.dislikes || 0) + (disliked ? 1 : 0)}
                  </button>
                  <button
                    className={`ps-engage-btn ${starred ? "ps-engage-btn-active" : ""}`}
                    onClick={() => setStarred((v) => !v)}
                  >
                    <Star size={14} /> Favorite
                  </button>
                  <button className="ps-engage-btn">
                    <Share2 size={14} /> Share
                  </button>
                </div> */}
              </>
                      ) : leftTab === "editorial" ? (
            editorialLoading ? (
              <div className="ps-empty-note">
                Loading editorial...
              </div>
            ) : !editorial ? (
              <div className="ps-empty-note">
                Unable to load editorial.
              </div>
            ) : !editorial.unlocked ? (
              <div className="ps-editorial-locked">

                <div className="ps-editorial-lock-icon">
                  <BookOpen size={22} />
                </div>

                <div className="ps-editorial-lock-title">
                  Editorial Locked
                </div>

                <div className="ps-editorial-lock-text">
                  Attempt the problem incorrectly{" "}
                  {editorial.requiredAttempts === 1
                    ? "once"
                    : `${editorial.requiredAttempts} times`}{" "}
                  to unlock the editorial.
                </div>

                <div className="ps-editorial-progress">
                  <div className="ps-editorial-progress-label">
                    Failed Attempts
                  </div>

                  <div className="ps-editorial-progress-value">
                    {editorial.failedAttempts} /{" "}
                    {editorial.requiredAttempts}
                  </div>
                </div>

                <div className="ps-editorial-progress-bar">
                  <div
                    className="ps-editorial-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        (editorial.failedAttempts /
                          editorial.requiredAttempts) *
                          100
                      )}%`,
                    }}
                  />
                </div>

              </div>
            ) : !editorial.editorial ? (
              <div className="ps-empty-note">
                No editorial published for this problem yet.
              </div>
            ) : (
              <div className="ps-editorial-content">

                <div className="ps-editorial-header">
                  <BookOpen size={18} />
                  <span>Editorial</span>
                </div>

                <div className="ps-editorial-text">
                  {editorial.editorial}
                </div>

              </div>
            )

          ) : leftTab === "solutions" ? (
            <div className="ps-empty-note">
              No community solutions yet. Be the first to share one!
            </div>

          ) : (
            <div className="ps-empty-note">
              You haven't submitted a solution to this problem yet.
            </div>
          )}

        </div>
      </div>

        {/* ---------------- Right: code editor ---------------- */}
        <div className="ps-right">
          <div className="ps-editor-header">
            <div className="ps-editor-header-title">{"</>"} Code</div>
            <select className="ps-lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.key} value={l.key}>{l.label}</option>
              ))}
            </select>
            <div className="ps-editor-header-spacer" />
          </div>

          <div className="ps-editor-body">
            <Editor
              height="100%"
              language={LANGUAGES.find((l) => l.key === language)?.monacoId}
              value={currentCode}
              onChange={updateCode}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* ---------------- Bottom: testcases / results ---------------- */}
          <div className="ps-bottom">
            <div className="ps-bottom-tabs">
              <button
                className={`ps-bottom-tab ${bottomTab === "testcase" ? "ps-bottom-tab-active" : ""}`}
                onClick={() => setBottomTab("testcase")}
              >
                <CheckCircle2 size={14} /> Testcase
              </button>
              <button
                className={`ps-bottom-tab ${bottomTab === "result" ? "ps-bottom-tab-active" : ""}`}
                onClick={() => setBottomTab("result")}
              >
                <XCircle size={14} /> Test Result
              </button>
            </div>

            <div className="ps-bottom-body">
              {bottomTab === "testcase" ? (
                loading ? (
                  <div className="ps-bottom-empty">Loading test cases…</div>
                ) : cases.length === 0 ? (
                  <div className="ps-bottom-empty">No test cases added for this problem yet.</div>
                ) : (
                  <>
                    <div className="ps-case-tabs">
                      {cases.map((c, i) => (
                        <button
                          key={c.id}
                          className={`ps-case-tab ${activeCaseIdx === i ? "ps-case-tab-active" : ""}`}
                          onClick={() => setActiveCaseIdx(i)}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                      {cases.length < MAX_VISIBLE_CASES && (
                        <button className="ps-case-add" onClick={addCustomCase}>
                          <Plus size={12} />
                        </button>
                      )}
                    </div>

                    {activeParams.length === 0 ? (
                      <div className="ps-param-field">
                        <div className="ps-param-label">input</div>
                        <textarea
                          className="ps-param-input"
                          rows={3}
                          value={getParamValue(activeCaseIdx, "raw", activeCase?.input || "")}
                          onChange={(e) => setParamValue(activeCaseIdx, "raw", e.target.value)}
                        />
                      </div>
                    ) : (
                      activeParams.map((p) => (
                        <div className="ps-param-field" key={p.key}>
                          <div className="ps-param-label">{p.key || "value"} =</div>
                          <input
                            className="ps-param-input"
                            value={getParamValue(activeCaseIdx, p.key, p.value)}
                            onChange={(e) => setParamValue(activeCaseIdx, p.key, e.target.value)}
                          />
                        </div>
                      ))
                    )}
                  </>
                )
              ) : running || submitting ? (
                <div className="ps-bottom-empty">{running ? "Running against test cases…" : "Submitting…"}</div>
              ) : judgeUnavailable ? (
                <div className="ps-bottom-empty">
                  No judge/execution backend connected yet — Run and Submit will work once that's wired up.
                </div>
              ) : submitResult ? (
                <div className="ps-submit-result">
                  <div
                    className={`ps-submit-header ${
                      submitResult.status === "ACCEPTED"
                        ? "ps-submit-header-pass"
                        : "ps-submit-header-fail"
                    }`}
                  >
                    {submitResult.status === "ACCEPTED" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}

                    {submitResult.status === "ACCEPTED"
                      ? "Problem Solved Successfully"
                      : submitResult.status || "Not Solved"}
                  </div>

                  <div className="ps-submit-cards-grid">
                    <div className="ps-submit-card">
                      <div className="ps-submit-card-label">Test Cases Passed</div>
                      <div className="ps-submit-card-value">
                        {submitResult.passedCount ?? "—"} / {submitResult.totalCount ?? "—"}
                      </div>
                    </div>

                    <div className="ps-submit-card ps-submit-card-highlight">
                      <div className="ps-submit-card-label">Attempts : Correct / Total</div>
                      <div className="ps-submit-card-value">
                        {submitResult.correctAttempts ?? "—"} / {submitResult.totalAttempts ?? "—"}
                      </div>
                      {submitResult.accuracy != null && (
                        <div className="ps-submit-card-sub">Accuracy : {submitResult.accuracy}%</div>
                      )}
                    </div>

                    <div className="ps-submit-card ps-submit-card-highlight">
                      <div className="ps-submit-card-label">Time Taken</div>
                      <div className="ps-submit-card-value">
                        {submitResult.executionTimeMs != null
                          ? `${submitResult.executionTimeMs} ms`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : runResults ? (
                <>
                  <div className={`ps-result-status ${runResults.every((r) => r.passed) ? "ps-result-pass" : "ps-result-fail"}`}>
                    {runResults.every((r) => r.passed) ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {runResults.every((r) => r.passed) ? "Accepted" : "Wrong Answer"}
                  </div>
                  <div className="ps-result-meta">
                    Runtime: {Math.max(0, ...runResults.map((r) => r.executionTimeMs || 0))} ms
                  </div>

                  <div className="ps-case-tabs">
                    {runResults.map((r, i) => (
                      <button
                        key={r.testcaseId}
                        className={`ps-case-tab ${resultCaseIdx === i ? "ps-case-tab-active" : ""} ${r.passed ? "ps-case-tab-pass" : "ps-case-tab-fail"}`}
                        onClick={() => setResultCaseIdx(i)}
                      >
                        {r.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {runResults[resultCaseIdx] && (() => {
                    const r = runResults[resultCaseIdx];
                    return r.compilationError ? (
                      <>
                        <div className="ps-result-block-label">Compilation Error</div>
                        <div className="ps-result-block-value">{r.errorMessage || "Compilation error"}</div>
                      </>
                    ) : r.timedOut ? (
                      <>
                        <div className="ps-result-block-label">Result</div>
                        <div className="ps-result-block-value">Time Limit Exceeded</div>
                      </>
                    ) : r.runtimeError ? (
                      <>
                        <div className="ps-result-block-label">Runtime Error</div>
                        <div className="ps-result-block-value">{r.errorMessage || "Runtime error"}</div>
                      </>
                    ) : (
                      <>
                        <div className="ps-result-block-label">Input</div>
                        <div className="ps-result-block-value">{r.input || "—"}</div>
                        <div className="ps-result-block-label">Output</div>
                        <div className="ps-result-block-value">{r.actualOutput || "—"}</div>
                        <div className="ps-result-block-label">Expected</div>
                        <div className="ps-result-block-value">{r.expectedOutput || "—"}</div>
                        {r.executionTimeMs != null && (
                          <>
                            <div className="ps-result-block-label">Execution Time</div>
                            <div className="ps-result-block-value">{r.executionTimeMs} ms</div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="ps-bottom-empty">Run your code to see results here.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}