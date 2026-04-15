import { useState } from "react";

function Profile() {
  const [user] = useState({
    name: "Sudip",
    username: "sudip123",
    email: "sudip@gmail.com",
    country: "India",
    gender: "male",
    wallet: 1200,
    followers: 320,
    liveStatus: 1,
    profileImage: "https://via.placeholder.com/150",
  });

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <img src={user.profileImage} style={styles.avatar} />
        <div>
          <h2>{user.name}</h2>
          <p>@{user.username}</p>
          <span style={{ color: "green", fontSize: 14 }}>
            ● {user.liveStatus ? "Live Now" : "Offline"}
          </span>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.stats}>
        <div style={styles.card}>
          <h3>💰 Wallet</h3>
          <p>₹{user.wallet}</p>
        </div>

        <div style={styles.card}>
          <h3>👥 Followers</h3>
          <p>{user.followers}</p>
        </div>

        <div style={styles.card}>
          <h3>🌍 Country</h3>
          <p>{user.country}</p>
        </div>

        <div style={styles.card}>
          <h3>⚧ Gender</h3>
          <p>{user.gender}</p>
        </div>
      </div>

      {/* DETAILS */}
      <div style={styles.details}>
        <h3>Profile Details</h3>

        <div style={styles.row}>
          <span>Email:</span>
          <span>{user.email}</span>
        </div>

        <div style={styles.row}>
          <span>Username:</span>
          <span>{user.username}</span>
        </div>

        <div style={styles.row}>
          <span>Status:</span>
          <span>{user.liveStatus ? "Live" : "Offline"}</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={styles.actions}>
        <button style={styles.btnPrimary}>Edit Profile</button>
        <button style={styles.btnDark}>Go Live 🎥</button>
      </div>

      {/* ACTIVITY / EXTRA SECTION */}
      <div style={styles.activity}>
        <h3>Recent Activity</h3>

        <ul>
          <li>🔴 Went live 2 hours ago</li>
          <li>💰 Earned ₹500 from tips</li>
          <li>👤 Gained 12 new followers</li>
        </ul>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #ff4d4f",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
  },

  details: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  btnPrimary: {
    flex: 1,
    padding: "10px",
    background: "#007bff",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },

  btnDark: {
    flex: 1,
    padding: "10px",
    background: "#111",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },

  activity: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
  },
};

export default Profile;