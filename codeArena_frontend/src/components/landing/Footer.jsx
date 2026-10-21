import "../../styles/landing.css";

function Footer() {
  return (
    <footer className="footer" id="about">

      <div className="container">

        <h2>CodeArena</h2>

        <p>
          Practice. Learn. Compete.
        </p>

        <div className="footer-links">

          <a href="/">Home</a>
          <a href="/">About</a>
          <a href="/">Privacy</a>
          <a href="/">Contact</a>

        </div>

        <p className="copyright">
          © 2026 CodeArena. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;