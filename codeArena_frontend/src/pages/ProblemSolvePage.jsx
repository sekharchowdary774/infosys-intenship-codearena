import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  List,
  ChevronLeft,
  ChevronRight,
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
  Building2,
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

const LANGUAGES = [
  { key: "cpp", label: "C++", monacoId: "cpp" },
  { key: "java", label: "Java", monacoId: "java" },
  { key: "python", label: "Python", monacoId: "python" },
  { key: "javascript", label: "JavaScript", monacoId: "javascript" },
];

const LEFT_TABS = [
  { key: "description", label: "Description", icon: FileText },
  { key: "editorial", label: "Editorial", icon: BookOpen },
  { key: "solutions", label: "Solutions", icon: MessageSquare },
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

export default function ProblemSolvePage() {
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leftTab, setLeftTab] = useState("description");
  const [openMeta, setOpenMeta] = useState(null);

  const [language, setLanguage] = useState("java");
  const [codeByLang, setCodeByLang] = useState({});

  const [bottomTab, setBottomTab] = useState("testcase");
  const [cases, setCases] = useState([]);
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [caseValues, setCaseValues] = useState({});

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
          companies: [],
          hint: data.hints || "",
          examples: [],
          constraints: "",
          likes: 0,
          dislikes: 0,
          starterCode: {
            cpp: data.starterCodeCpp || "",
            java: data.starterCodeJava || "",
            python: data.starterCodePython || "",
            javascript: data.starterCodeJavascript || "",
          },
          editorial: data.editorial || "",
          testcases: [],
        };

        // Get test cases for THIS problem
        const testCaseResponse = await api.get(`/test-cases/problem/${problemId}`);

        const testCases = Array.isArray(testCaseResponse.data)
          ? testCaseResponse.data.map((tc) => ({
              id: tc.id,
              input: tc.input || "",
              output: tc.expectedOutput || "",
              hidden: tc.hidden,
              timeLimitMs: tc.timeLimitMs,
            }))
          : [];

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

  const currentCode = codeByLang[language] ?? "";

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
    setCases((prev) => [...prev, { id: `custom-${Date.now()}`, input: "", output: "", custom: true }]);
    setActiveCaseIdx(cases.length);
    setBottomTab("testcase");
  }

  const handleRun = useCallback(async () => {
    if (!problem || !activeCase) return;

    setRunning(true);
    setRunResults(null);
    setSubmitResult(null);
    setJudgeUnavailable(false);
    setBottomTab("result");

    const { ok, data } = await apiFetch("/submissions/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        testCaseId: activeCase.id,
        language: language.toUpperCase(),
        sourceCode: currentCode,
      }),
    });

    if (ok && data) {
      setRunResults([
        {
          testcaseId: activeCase.id,
          input: activeCase.input,
          expectedOutput: activeCase.output,
          actualOutput: data.output ?? "",
          passed:
            !data.compilationError &&
            !data.timedOut &&
            !data.runtimeError &&
            data.output?.trim() === activeCase.output?.trim(),
          executionTimeMs: data.executionTimeMs,
          memoryUsedKb: data.memoryUsedKb,
          errorMessage: data.error,
          compilationError: data.compilationError,
          timedOut: data.timedOut,
          runtimeError: data.runtimeError,
        },
      ]);
    } else {
      setJudgeUnavailable(true);
    }

    setRunning(false);
  }, [problem, activeCase, language, currentCode]);

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
    } else {
      setJudgeUnavailable(true);
    }

    setSubmitting(false);
  }, [problem, language, currentCode]);

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

        <div className="ps-coins"><Coins size={15} /> 0</div>
        <button className="ps-icon-btn"><Bell size={16} /></button>
        <div className="ps-avatar-sm" />
        <button className="ps-premium-btn">Premium</button>
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
                <h1 className="ps-problem-title">
                  {problem.id}. {problem.title || "Untitled problem"}
                </h1>
                <div className="ps-meta-row">
                  <span className={`ps-diff-badge ps-diff-${(problem.difficulty || "easy").toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                  <button className="ps-meta-pill" onClick={() => setOpenMeta(openMeta === "topics" ? null : "topics")}>
                    <Tag size={12} /> Topics
                  </button>
                  <button className="ps-meta-pill" onClick={() => setOpenMeta(openMeta === "companies" ? null : "companies")}>
                    <Building2 size={12} /> Companies
                  </button>
                  <button className="ps-meta-pill" onClick={() => setOpenMeta(openMeta === "hint" ? null : "hint")}>
                    <Lightbulb size={12} /> Hint
                  </button>
                </div>

                {openMeta === "topics" && (
                  <div className="ps-meta-dropdown">
                    {(problem.topics || []).length ? problem.topics.map((t) => <span key={t} className="ps-tag-pill">{t}</span>) : <span className="ps-meta-dropdown-empty">No topics tagged.</span>}
                  </div>
                )}
                {openMeta === "companies" && (
                  <div className="ps-meta-dropdown">
                    {(problem.companies || []).length ? problem.companies.map((c) => <span key={c} className="ps-tag-pill">{c}</span>) : <span className="ps-meta-dropdown-empty">No companies tagged.</span>}
                  </div>
                )}
                {openMeta === "hint" && (
                  <div className="ps-meta-dropdown">
                    {problem.hint || <span className="ps-meta-dropdown-empty">No hint available.</span>}
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

                <div className="ps-engage-row">
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
                </div>
              </>
            ) : leftTab === "editorial" ? (
              <div className="ps-empty-note">No editorial published for this problem yet.</div>
            ) : leftTab === "solutions" ? (
              <div className="ps-empty-note">No community solutions yet. Be the first to share one!</div>
            ) : (
              <div className="ps-empty-note">You haven't submitted a solution to this problem yet.</div>
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
                      <button className="ps-case-add" onClick={addCustomCase}>
                        <Plus size={12} />
                      </button>
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
                <>
                  <div className={`ps-result-status ${submitResult.status === "Accepted" ? "ps-result-pass" : "ps-result-fail"}`}>
                    {submitResult.status === "Accepted" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {submitResult.status}
                  </div>
                  <div className="ps-result-meta">
                    {submitResult.passedCount}/{submitResult.totalCount} testcases passed
                    {submitResult.runtimeMs != null && ` · ${submitResult.runtimeMs} ms`}
                    {submitResult.memoryKb != null && ` · ${submitResult.memoryKb} KB`}
                  </div>
                </>
              ) : runResults ? (
                <>
                  {runResults.map((r) => (
                    <div key={r.testcaseId} style={{ marginBottom: 16 }}>
                      <div
                        className={`ps-result-status ${r.passed ? "ps-result-pass" : "ps-result-fail"}`}
                        style={{ fontSize: 12.5 }}
                      >
                        {r.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        Case {cases.findIndex((c) => c.id === r.testcaseId) + 1}
                      </div>

                      {r.compilationError ? (
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
                      )}
                    </div>
                  ))}
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