import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import AdminSidebar from "../../components/AdminSidebar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";
import AgentSidebar from "../../components/AgentSidebar";

export default function AgentLive() {
    const { user } = useSelector((state) => state.auth);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 6;

  const [alluser, setAllUser] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`${ENDPOINTS.AGENTLIVEUSER}/creator/${user.username}`);

      if (res?.data) {
        setAllUser(res.data.users || []);
      }
    } catch (error) {
      console.log("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const DeleteUsers = async (id) => {
    const confirmDelete = window.confirm(
      "⚠ Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await axiosInstance.delete(
        `${ENDPOINTS.DELETEUSER}/${id}`
      );

      if (res?.data) {
        setAllUser((prev) =>
          prev.filter((user) => user._id !== id)
        );
      }

    } catch (error) {
      console.log("Error deleting user", error);
    } finally {
      setLoading(false);
    }
  };

  const UpdateUsers = async (id, status) => {
    const confirm = window.confirm(
      "Are you sure you want to change user status?"
    );

    if (!confirm) return;

    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `${ENDPOINTS.UPDATEUSERSTATUS}/${id}/${status}`
      );

      if (res?.data?.user) {
        const updatedUser = res.data.user;

        setAllUser((prev) =>
          prev.map((u) =>
            u._id === id ? updatedUser : u
          )
        );
      }

    } catch (error) {
      console.log("Error updating user status", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MAP API DATA
  const users = alluser.map((u) => {
    const today = new Date();
    const token = u.tokenDate ? new Date(u.tokenDate) : null;

    const isToday =
      token &&
      token.getDate() === today.getDate() &&
      token.getMonth() === today.getMonth() &&
      token.getFullYear() === today.getFullYear();

    return {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.username || "-",
      gender: u.gender || "-",
      country: u.country || "-",
      wallet: u.wallet || "0",

      status: u.userStatus === 1 ? "active" : "blocked",
      live: u.liveStatus === 1 ? "live" : "offline",

      // ✅ CONDITION APPLY
      dailyLimit: isToday ? u.dailyLimit || 0 : "Not Set",
      getdailyLimit: isToday ? u.getdailyLimit || 0 : "0",

      privateShowAmount: u.privateShowAmount || 0,
      exclusiveShowAmount: u.exclusiveShowAmount || 0,

      tokenDate: u.tokenDate
        ? new Date(u.tokenDate).toLocaleString()
        : "-",

      image:
        u.profileImage ||
        `https://i.pravatar.cc/100?u=${u._id}`,
    };
  });

  // ✅ FILTER
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || u.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ✅ PAGINATION
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  {loading && (
    <div className="text-center my-3">
      ⏳ Loading users...
    </div>
  )}

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <AgentSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background:
              "linear-gradient(135deg,#eef2ff,#f8fafc)",
          }}
        >

          {/* HEADER */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1">
              👤 Users Management
            </h2>
            <small className="text-muted">
              Manage all platform users easily
            </small>
          </div>

          {/* SEARCH */}
          <div className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}
          >
            <div className="d-flex flex-wrap gap-3">

              <input
                type="text"
                placeholder="🔍 Search users..."
                className="form-control rounded-pill px-3"
                style={{ maxWidth: 250 }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                className="form-select rounded-pill px-3"
                style={{ maxWidth: 180 }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">🟢 Active</option>
                <option value="blocked">🔴 Blocked</option>
              </select>

            </div>
          </div>

          {/* TABLE */}
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div style={{
              height: 5,
              background:
                "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
            }} />

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
                      {/* <th>Token</th> */}

                      <th>Status</th>
                      <th className="text-end pe-3">Action</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>

                    {currentUsers.map((user, i) => (
                      <tr
                key={user.id}
                style={{
                  transition: "all 0.2s ease",
                  backgroundColor:
                    user.status !== "active"
                      ? "rgba(239,68,68,0.08)" // 🔴 blocked light red
                      : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (user.status !== "active") {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239,68,68,0.15)"; // 🔴 darker red hover
                  } else {
                    e.currentTarget.style.backgroundColor = "#f9fafb"; // normal hover
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
                          {indexOfFirst + i + 1}
                        </td>

                        {/* USER + PROFILE + LIVE DOT */}
                        <td>
  {user.live === "live" ? (
    <Link
      to={`/live/${user.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
        
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

          {/* 🟢 LIVE DOT */}
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
              boxShadow: "0 0 6px rgba(34,197,94,0.8)",
            }}
          />
        </div>

        <div>
          <div className="fw-bold">{user.name}</div>
          <small className="text-muted">{user.email}</small>
        </div>

      </div>
    </Link>
  ) : (
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
      </div>

      <div>
        <div className="fw-bold">{user.name}</div>
        <small className="text-muted">{user.email}</small>
      </div>

    </div>
  )}
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
                          {user.dailyLimit === "Not Set" ? (
                            <span style={{ color: "#ef4444", fontWeight: 500 }}>
                              Not Set
                            </span>
                          ) : (
                            <span className="fw-bold text-success">
                              💰 {user.dailyLimit}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            💰 {user.privateShowAmount}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            💰 {user.exclusiveShowAmount}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            💰 {user.getdailyLimit}
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

                        {/* ACTION */}
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

              {/* PAGINATION */}
              <div className="d-flex justify-content-center gap-2 p-3">

                <button
                  className="btn btn-sm btn-outline-dark rounded-pill"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ◀
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm rounded-pill ${
                      currentPage === i + 1
                        ? "btn-dark px-3"
                        : "btn-outline-dark"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn btn-sm btn-outline-dark rounded-pill"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  ▶
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
