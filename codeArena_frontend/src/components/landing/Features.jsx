import { FaLaptopCode, FaDocker, FaTrophy, FaChartLine } from "react-icons/fa";
import "../../styles/landing.css";

const features = [
  {
    icon: <FaLaptopCode />,
    title: "Coding Problems",
    description:
      "Solve interview and competitive programming questions categorized by topic and difficulty.",
  },
  {
    icon: <FaLaptopCode />,
    title: "Contests",
    description:
  "Join weekly coding contests, tackle real-world programming challenges, and compete with developers across the globe.",
  },
  {
    icon: <FaTrophy />,
    title: "Leaderboards",
    description:
      "Compete with developers worldwide and improve your global ranking.",
  },
  {
    icon: <FaChartLine />,
    title: "Progress Analytics",
    description:
      "Track solved problems, streaks, acceptance rate and language statistics.",
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="container">

        <div className="section-title">
          <h2>Platform Features</h2>
          <p>Everything you need to become interview ready.</p>
        </div>

        <div className="feature-grid">

          {features.map((feature, index) => (
            <div className="feature-card" key={index}>

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;