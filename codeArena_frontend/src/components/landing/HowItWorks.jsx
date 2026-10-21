import "../../styles/landing.css";

const steps = [
  "Choose a Problem",
  "Write Your Code",
  "Run Test Cases",
  "Submit Solution",
  "Track Progress",
];

function HowItWorks() {
  return (
    <section className="workflow">

      <div className="container">

        <div className="section-title">
          <h2>How It Works</h2>
          <p>Five simple steps to master coding.</p>
        </div>

        <div className="workflow-grid">

          {steps.map((step, index) => (
            <div className="workflow-card" key={index}>

              <div className="step-number">
                {index + 1}
              </div>

              <h3>{step}</h3>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;