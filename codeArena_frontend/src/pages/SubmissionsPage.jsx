import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  Code2,
} from "lucide-react";

import { getMySubmissions } from "../api/submissionApi";
import "../styles/SubmissionsPage.css";

function getStatusClass(status) {
  switch (status) {
    case "ACCEPTED":
      return "submission-status accepted";

    case "WRONG_ANSWER":
      return "submission-status wrong";

    case "COMPILATION_ERROR":
    case "RUNTIME_ERROR":
      return "submission-status error";

    case "TIME_LIMIT_EXCEEDED":
    case "MEMORY_LIMIT_EXCEEDED":
      return "submission-status warning";

    default:
      return "submission-status";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "ACCEPTED":
      return <CheckCircle2 size={15} />;

    case "WRONG_ANSWER":
      return <XCircle size={15} />;

    case "COMPILATION_ERROR":
    case "RUNTIME_ERROR":
      return <AlertTriangle size={15} />;

    default:
      return <Clock3 size={15} />;
  }
}

function formatStatus(status) {
  return status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString();
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMySubmissions();

        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load submissions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  return (
    <div className="submissions-page">

      <header className="submissions-header">
        <div>
          <Link
            to="/problemset"
            className="submissions-back"
          >
            <ArrowLeft size={16} />
            Back to Problems
          </Link>

          <h1>My Submissions</h1>

          <p>
            View your coding submissions and execution results.
          </p>
        </div>

        <div className="submissions-count">
          <Code2 size={18} />
          {submissions.length} submissions
        </div>
      </header>

      <main className="submissions-content">

        {loading && (
          <div className="submissions-state">
            Loading submissions...
          </div>
        )}

        {!loading && error && (
          <div className="submissions-state submissions-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          submissions.length === 0 && (
            <div className="submissions-state">
              <Code2 size={32} />

              <h3>No submissions yet</h3>

              <p>
                Start solving problems to see your
                submissions here.
              </p>

              <Link
                to="/problemset"
                className="submissions-primary-btn"
              >
                Browse Problems
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          submissions.length > 0 && (
            <div className="submissions-table-wrapper">

              <table className="submissions-table">

                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Runtime</th>
                    <th>Memory</th>
                    <th>Submitted</th>
                  </tr>
                </thead>

                <tbody>

                  {submissions.map((submission) => (
                    <tr key={submission.id}>

                      <td>
                        <Link
                          to={`/problems/${submission.problemId}`}
                          className="submission-problem"
                        >
                          Problem #{submission.problemId}
                        </Link>
                      </td>

                      <td>
                        <span className="submission-language">
                          {submission.language}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            submission.status
                          )}
                        >
                          {getStatusIcon(
                            submission.status
                          )}

                          {formatStatus(
                            submission.status
                          )}
                        </span>
                      </td>

                      <td>
                        {submission.executionTimeMs != null
                          ? `${submission.executionTimeMs} ms`
                          : "-"}
                      </td>

                      <td>
                        {submission.memoryUsedKb != null
                          ? `${submission.memoryUsedKb} KB`
                          : "-"}
                      </td>

                      <td>
                        {formatDate(
                          submission.createdAt
                        )}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

      </main>
    </div>
  );
}