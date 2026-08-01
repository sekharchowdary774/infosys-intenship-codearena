import "../../styles/landing.css";

const languages = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
];

function Languages() {
  return (
    <section className="languages" id="languages">

      <div className="container">

        <div className="section-title">
          <h2>Supported Languages</h2>
          <p>Practice using your favorite programming language.</p>
        </div>

        <div className="language-grid">

          {languages.map((language, index) => (
            <div className="language-card" key={index}>
              {language}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Languages;