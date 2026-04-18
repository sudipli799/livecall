import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AgentSidebar from "../../components/AgentSidebar";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";
import { useSelector } from "react-redux";

export default function AgentDashboard() {

  const { user } = useSelector((state) => state.auth);

  const [alluser, setAllUser] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(
        `${ENDPOINTS.AGENTUSER}/creator/${user.username}`
      );

      setAllUser(res?.data?.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= STATS =================
  const totalUsers = alluser.length;

  const activeUsers = alluser.filter(
    (u) => u.userStatus === 1
  ).length;

  const blockedUsers = alluser.filter(
    (u) => u.userStatus === 0
  ).length;

  const today = new Date();

  const todayUsers = alluser.filter((u) => {
    const d = new Date(u.registerDate);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }).length;

  // ================= TABLE MAP =================
  const users = alluser.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    gender: u.gender,
    country: u.country,
    wallet: u.wallet,
    status: u.userStatus === 1 ? "active" : "blocked",
    live: u.liveStatus === 1 ? "live" : "offline",
    image:
      u.profileImage ||
      `https://i.pravatar.cc/100?u=${u._id}`,
  }));

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <AgentSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
          }}>

          {/* HEADER */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1">
              👨‍💼 Agent Dashboard
            </h2>
            <small className="text-muted">
              Manage your users & activity
            </small>
          </div>

          {/* ================= STATS ================= */}
          <div className="row g-4 mb-4">

            {[
              ["Total Users", totalUsers, "👥", "#3b82f6"],
              ["Today Users", todayUsers, "📅", "#f59e0b"],
              ["Active Users", activeUsers, "🟢", "#22c55e"],
              ["Blocked Users", blockedUsers, "🔴", "#ef4444"],
            ].map(([title, value, icon, color], i) => (

              <div className="col-md-3" key={i}>
                <div
                  className="card border-0 text-white h-100"
                  style={{
                    background: `linear-gradient(135deg,${color},#020617)`,
                    borderRadius: "20px",
                    boxShadow: "0 15px 40px rgba(0,0,0,.35)",
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="small opacity-75">
                          {title}
                        </div>
                        <h4 className="fw-bold">{value}</h4>
                      </div>
                      <div style={{ fontSize: 30 }}>{icon}</div>
                    </div>
                  </div>
                </div>
              </div>

            ))}

          </div>

          {/* ================= USERS TABLE ================= */}
          {/* ================= USERS TABLE (EXACT SAME AS YOUR PAGE) ================= */}

<div className="card border-0 rounded-4 shadow-lg overflow-hidden">

  <div
    style={{
      height: 5,
      background:
        "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
    }}
  />

  <div className="card-body p-0">

    <div className="table-responsive">

      <table className="table align-middle mb-0 overflow-hidden">

        {/* HEADER */}
        <thead
          className="text-white"
          style={{
            background:
              "linear-gradient(90deg,#6366f1,#4f46e5,#ec4899)",
          }}
        >
          <tr>
            <th className="py-3">#</th>
            <th>User</th>
            <th>Gender</th>
            <th>Country</th>
            <th>Wallet</th>

            <th>Goal</th>
            <th>Private</th>
            <th>Exclusive</th>
            <th>GetLimit</th>

            <th>Status</th>
            <th className="text-end pe-3">Action</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>

          {users.map((user, i) => (

            <tr
              key={user.id}
              style={{
                transition: "all 0.2s ease",
                backgroundColor:
                  user.status !== "active"
                    ? "rgba(239,68,68,0.08)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (user.status !== "active") {
                  e.currentTarget.style.backgroundColor =
                    "rgba(239,68,68,0.15)";
                } else {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }

                e.currentTarget.style.transform = "scale(1.002)";
                e.currentTarget.style.boxShadow =
                  "0 8px 18px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  user.status !== "active"
                    ? "rgba(239,68,68,0.08)"
                    : "transparent";

                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >

              {/* INDEX */}
              <td className="fw-semibold text-muted">
                {i + 1}
              </td>

              {/* USER */}
              <td>
                <div className="d-flex align-items-center gap-2">

                  <div style={{ position: "relative" }}>
                    <img
                      src={user.image}
                      alt="profile"
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #6366f1",
                      }}
                    />

                    {user.live === "live" && (
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          width: 12,
                          height: 12,
                          backgroundColor: "#22c55e",
                          borderRadius: "50%",
                          border: "2px solid white",
                          boxShadow:
                            "0 0 6px rgba(34,197,94,0.8)",
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <div className="fw-bold">
                      {user.name}
                    </div>
                    <small className="text-muted">
                      {user.email}
                    </small>
                  </div>

                </div>
              </td>

              {/* DATA */}
              <td>{user.gender}</td>
              <td>{user.country}</td>

              <td>
                <span className="fw-bold text-success">
                  💰 {user.wallet}
                </span>
              </td>

              <td>
                <span className="fw-bold text-success">
                  💰 {user.dailyLimit || 0}
                </span>
              </td>

              <td>
                <span className="fw-bold text-success">
                  💰 {user.privateShowAmount || 0}
                </span>
              </td>

              <td>
                <span className="fw-bold text-success">
                  💰 {user.exclusiveShowAmount || 0}
                </span>
              </td>

              <td>
                <span className="fw-bold text-success">
                  💰 {user.getdailyLimit || 0}
                </span>
              </td>

              {/* STATUS */}
              <td>
                <span
                  className={`badge px-3 py-2 rounded-pill ${
                    user.status === "active"
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  }`}
                >
                  {user.status}
                </span>
              </td>

              {/* ACTION BUTTONS */}
              <td className="text-end">

                <button
                  className={`btn btn-sm rounded-pill me-2 ${
                    user.status === "active"
                      ? "btn-outline-warning"
                      : "btn-outline-success"
                  }`}
                  onClick={() =>
                    UpdateUsers(
                      user.id,
                      user.status === "active" ? 0 : 1
                    )
                  }
                >
                  {user.status === "active"
                    ? "Block"
                    : "Unblock"}
                </button>

                <button
                  className="btn btn-sm btn-outline-danger rounded-pill"
                  onClick={() => DeleteUsers(user.id)}
                >
                  🗑 Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

    {/* PAGINATION (SAME) */}
    

  </div>
</div>

        </div>
      </div>
    </div>
  );
}