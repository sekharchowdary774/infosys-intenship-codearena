import "../../styles/landing.css";

function Stats() {
  return (
    <section className="stats">

      <div className="container">

        <div className="stats-grid">

          <div className="stat-card">
            <h2>15K+</h2>
            <p>Active Users</p>
          </div>

          <div className="stat-card">
            <h2>1000+</h2>
            <p>Coding Problems</p>
          </div>

          <div className="stat-card">
            <h2>2M+</h2>
            <p>Submissions</p>
          </div>

          <div className="stat-card">
            <h2>50+</h2>
            <p>Problem Topics</p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Stats;