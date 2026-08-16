import "../../styles/landing.css";

const users = [
  {
    rank: 1,
    name: "Alex",
    solved: 742,
    accuracy: "99%"
  },
  {
    rank: 2,
    name: "Sophia",
    solved: 715,
    accuracy: "98%"
  },
  {
    rank: 3,
    name: "John",
    solved: 690,
    accuracy: "97%"
  },
  {
    rank: 4,
    name: "Sekhar",
    solved: 650,
    accuracy: "96%"
  },
];

function LeaderboardPreview() {
  return (
    <section className="leaderboard" id="leaderboard">

      <div className="container">

        <div className="section-title">
          <h2>Leaderboard</h2>
        </div>

        <table>

          <thead>

            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Solved</th>
              <th>Accuracy</th>
            </tr>

          </thead>

          <tbody>

            {users.map((user) => (
              <tr key={user.rank}>
                <td>{user.rank}</td>
                <td>{user.name}</td>
                <td>{user.solved}</td>
                <td>{user.accuracy}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}

export default LeaderboardPreview;