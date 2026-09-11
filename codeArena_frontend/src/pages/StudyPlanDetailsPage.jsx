import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudyPlan,
  getStudyPlanProblems,
} from "../api/studyPlanApi";

import "../styles/StudyPlanDetailsPage.css";

function StudyPlanDetailsPage() {

  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [problems, setProblems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const loadStudyPlan = async () => {

      try {

        setLoading(true);
        setError("");

        const [planData, problemData] =
          await Promise.all([
            getStudyPlan(planId),
            getStudyPlanProblems(planId),
          ]);

        setPlan(planData);
        setProblems(problemData);

      } catch (err) {

        console.error(
          "Failed to load study plan:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Failed to load study plan."
        );

      } finally {

        setLoading(false);

      }
    };

    loadStudyPlan();

  }, [planId]);


  const openProblem = (problemId) => {

    navigate(`/problems/${problemId}`);

  };


  if (loading) {

    return (
      <div className="study-plan-details-page">

        <div className="study-plan-details-loading">
          Loading study plan...
        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="study-plan-details-page">

        <div className="study-plan-details-error">
          {error}
        </div>

      </div>
    );
  }


  if (!plan) {
    return null;
  }


  return (
    <div className="study-plan-details-page">

      {/* Back */}

      <button
        className="study-plan-back-button"
        onClick={() => navigate("/study-plans")}
      >
        ← Back to Study Plans
      </button>


      {/* Header */}

      <div className="study-plan-details-header">

        <div>

          <span className="study-plan-details-label">
            STUDY PLAN
          </span>

          <h1>
            {plan.name}
          </h1>

          <p>
            {plan.description}
          </p>

        </div>


        {/* Progress Card */}

        <div className="study-plan-details-progress">

          <div className="progress-top">

            <span>
              Your Progress
            </span>

            <strong>
              {plan.progressPercentage ?? 0}%
            </strong>

          </div>


          <div className="details-progress-bar">

            <div
              className="details-progress-fill"
              style={{
                width: `${plan.progressPercentage ?? 0}%`,
              }}
            />

          </div>


          <div className="progress-bottom">

            <span>
              {plan.solvedProblems ?? 0} solved
            </span>

            <span>
              {plan.totalProblems ?? 0} total
            </span>

          </div>

        </div>

      </div>


      {/* Problems */}

      <div className="study-plan-problems-section">

        <div className="study-plan-problems-header">

          <div>

            <h2>
              Problems
            </h2>

            <p>
              Complete the problems in order to
              strengthen your skills.
            </p>

          </div>

          <span className="problem-count">
            {problems.length} Problems
          </span>

        </div>


        <div className="study-plan-problems-list">

          {problems.map((problem) => (

            <div
              className="study-plan-problem-row"
              key={problem.problemId}
            >

              {/* Number */}

              <div className="problem-number">
                {problem.orderNumber}
              </div>


              {/* Problem info */}

              <div className="problem-info">

                <h3>
                  {problem.title}
                </h3>

                <div className="problem-meta">

                  <span
                    className={`difficulty ${problem.difficulty?.toLowerCase()}`}
                  >
                    {problem.difficulty}
                  </span>

                  <span className="problem-topic">
                    {problem.topic}
                  </span>

                </div>

              </div>


              {/* Button */}

              <button
                className="start-practising-button"
                onClick={() =>
                  openProblem(problem.problemId)
                }
              >
                Start Practising
                <span>→</span>
              </button>

            </div>

          ))}

        </div>


        {/* Empty */}

        {problems.length === 0 && (

          <div className="study-plan-problems-empty">

            <h3>
              No problems added yet
            </h3>

            <p>
              Problems will appear here once they
              are added to this study plan.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default StudyPlanDetailsPage;