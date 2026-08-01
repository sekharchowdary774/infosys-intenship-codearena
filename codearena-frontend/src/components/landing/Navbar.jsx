import { Link } from "react-router-dom";
import "../../styles/landing.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-container">
        <div className="logo">
          <Link to="/">CodeArena</Link>
        </div>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#languages">Languages</a>
          <a href="#leaderboard">Leaderboard</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;