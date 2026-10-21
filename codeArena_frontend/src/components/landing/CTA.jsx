
import { Link } from "react-router-dom";
import "../../styles/landing.css";

function CTA() {
  return (
    <section className="cta">

      <div className="container">

        <h2>Start Solving. Keep Learning. Rank Higher.</h2>

        <p>
          Join thousands of developers improving their coding skills every day.
        </p>

        <Link to="/register" className="cta-btn">
          Get Started
        </Link>

      </div>

    </section>
  );
}

export default CTA;