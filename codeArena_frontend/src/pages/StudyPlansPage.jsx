import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudyPlans } from "../api/studyPlanApi";


import "../styles/StudyPlansPage.css";

function StudyPlansPage() {

  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const loadPlans = async () => {

      try {

        setLoading(true);
        setError("");

        const data = await getStudyPlans();

        setPlans(data);

      } catch (err) {

        console.error("Failed to load study plans:", err);

        setError(
          err.response?.data?.message ||
          "Failed to load study plans."
        );

      } finally {

        setLoading(false);

      }
    };

    loadPlans();

  }, []);


  const openPlan = (planId) => {
    navigate(`/study-plans/${planId}`);
  };


  if (loading) {

    return (
      <div className="study-plans-page">

        <div className="study-plans-loading">
          Loading study plans...
        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="study-plans-page">

        <div className="study-plans-error">
          {error}
        </div>

      </div>
    );
  }


  return (
    <div className="study-plans-page">

      {/* Header */}

      <div className="study-plans-header">

        <div>

          <span className="study-plans-label">
            LEARN & PRACTICE
          </span>

          <h1>
            Study Plans
          </h1>

          <p>
            Follow curated problem sets designed to
            strengthen your problem-solving skills.
          </p>

        </div>

      </div>


      {/* Plans */}

      <div className="study-plans-grid">

        {plans.map((plan) => (

          <div
            className="study-plan-card"
            key={plan.id}
          >

            <div className="study-plan-card-top">

              <div className="study-plan-icon">
                &lt;/&gt;
              </div>

              <span className="study-plan-count">
                {plan.totalProblems} Problems
              </span>

            </div>


            <h2>
              {plan.name}
            </h2>


            <p className="study-plan-description">
              {plan.description ||
                "Practice carefully selected coding problems and improve your problem-solving skills."}
            </p>


            {/* Progress */}

            <div className="study-plan-progress-section">

              <div className="study-plan-progress-info">

                <span>
                  Progress
                </span>

                <span>
                  {plan.solvedProblems ?? 0} / {plan.totalProblems ?? 0}
                </span>

              </div>


              <div className="study-plan-progress-bar">

                <div
                 className="study-plan-progress-fill"
                style={{
                  width: `${plan.progressPercentage ?? 0}%`
                }}
                />

              </div>


              <span className="study-plan-progress-percentage">
              {plan.progressPercentage ?? 0}%
              </span>

            </div>


            {/* Button */}

            <button
              className="study-plan-button"
              onClick={() => openPlan(plan.id)}
            >
              View Study Plan
              <span>→</span>
            </button>

          </div>

        ))}

      </div>


      {/* Empty state */}

      {plans.length === 0 && (

        <div className="study-plans-empty">

          <h2>
            No study plans available
          </h2>

          <p>
            Study plans will appear here once they are created.
          </p>

        </div>

      )}

    </div>
  );
}

export default StudyPlansPage;