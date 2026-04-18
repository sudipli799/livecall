import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminSidebar from "../../components/AdminSidebar";

import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";

export default function AdminAgent() {
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

      const res = await axiosInstance.get(`${ENDPOINTS.ALLUSER}/agent`);

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
  const users = alluser.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.username || "-",
    gender: u.gender || "-",
    country: u.country || "-",
    wallet: u.wallet || "0",
    status: u.userStatus === 1 ? "active" : "blocked",
    join: u.registerDate
      ? new Date(u.registerDate).toLocaleDateString()
      : "-",
    image:
      u.profileImage ||
      `https://i.pravatar.cc/100?u=${u._id}`,
  }));

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

        <AdminSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background:
              "linear-gradient(135deg,#eef2ff,#f8fafc)",
          }}
        >

          {/* HEADER */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1">
              👤 Agent Management
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

                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Country</th>
                      <th>Wallet</th>
                      <th>Join</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentUsers.map((user, i) => (
                      <tr key={user.id}>

                        <td className="fw-semibold">
                          {indexOfFirst + i + 1}
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={user.image}
                              style={{
                                width: 45,
                                height: 45,
                                borderRadius: "50%",
                              }}
                            />
                            <div>
                              <div className="fw-semibold">
                                {user.name}
                              </div>
                              <small className="text-muted">
                                {user.email}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>{user.phone}</td>
                        <td>{user.gender}</td>
                        <td>{user.country}</td>

                        <td>
                          💰 {user.wallet}
                        </td>

                        <td>{user.join}</td>

                        <td>
                          <span className={`badge px-3 py-2 rounded-pill ${
                            user.status === "active"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}>
                            {user.status}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-warning rounded-pill me-2"
                            onClick={() =>
                              UpdateUsers(
                                user.id,
                                user.status === "active" ? 0 : 1
                              )
                            }
                          >
                            {user.status === "active" ? "⚠ Block" : "✅ Unblock"}
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