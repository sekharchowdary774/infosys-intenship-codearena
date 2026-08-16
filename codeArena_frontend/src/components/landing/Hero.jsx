import { Link } from "react-router-dom";
import "../../styles/landing.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-container">

        <div className="hero-left">

          <span className="hero-badge">
            🚀 Practice Like a Pro
          </span>

          <h1>
            Improve Your Coding Skills With
            <span> CodeArena</span>
          </h1>

          <p>
            Solve coding challenges, compete on leaderboards,
            execute code securely, and prepare for technical interviews
            with real-world programming problems.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Start Coding
            </Link>

            <button className="secondary-btn">
              Explore Problems
            </button>

          </div>

        </div>

        <div className="hero-right">

          <div className="editor-preview">

            <div className="editor-header">
              Main.java
            </div>

            <pre>
{`public class Main {

    public static void main(String[] args){

        System.out.println("Hello CodeArena");

    }

}`}
            </pre>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;