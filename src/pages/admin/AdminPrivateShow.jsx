import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminPrivateShow() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ✅ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${ENDPOINTS.ADMINREQUEST}`);
      if (res?.data?.data) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching requests", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ filtering logic
  const filtered = requests.filter((req) => {
    const matchStatus =
      statusFilter === "all" || req.status === statusFilter;

    const matchSearch = req.sender_id?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  // ✅ pagination logic
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <CreatorSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{ background: "linear-gradient(135deg,#eef2ff,#f8fafc)" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">🎥 Show Requests</h2>

            {/* 🔍 search */}
            <input
              type="text"
              placeholder="Search user..."
              className="form-control w-auto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 🎯 filter */}
          <div className="mb-3">
            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Started">Started</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {loading && (
            <div className="text-center my-3">⏳ Loading...</div>
          )}

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
                <table className="table align-middle mb-0">
                  <thead
                    className="text-white"
                    style={{
                      background:
                        "linear-gradient(90deg,#6366f1,#4f46e5,#ec4899)",
                    }}
                  >
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Token/min</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((req, i) => {
                      const minutes = Math.ceil((req.duration || 0) / 60);
                      const total = minutes * (req.token || 0);

                      return (
                        <tr
                          key={req._id}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f1f5f9")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "")
                          }
                        >
                          <td>{i + 1}</td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={req.sender_id?.profileImage}
                                alt=""
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                }}
                              />
                              <div>
                                <div className="fw-bold">
                                  {req.sender_id?.name}
                                </div>
                                <small className="text-muted">
                                  @{req.sender_id?.username}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge bg-info">{req.type}</span>
                          </td>

                          <td>💰 {req.token}</td>

                          <td>
                            <span
                              className={`badge ${
                                req.status === "Pending"
                                  ? "bg-warning text-dark"
                                  : req.status === "Started"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>

                          <td>{minutes} min</td>

                          <td className="fw-bold text-success">💸 {total}</td>

                          <td>
                            {new Date(req.createdAt).toLocaleString()}
                          </td>

                          <td>
                            {req.status === "Pending" && (
                              <button
                                className="btn btn-sm btn-primary rounded-pill"
                                onClick={() =>
                                  navigate(`/monitor/${req._id}`)
                                }
                              >
                                ▶ Start
                              </button>
                            )}

                            {req.status === "Started" && (
                              <button className="btn btn-sm btn-success rounded-pill">
                                🟢 Live
                              </button>
                            )}

                            {req.status === "Completed" && (
                              <button className="btn btn-sm btn-secondary rounded-pill">
                                ✔ Done
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 📄 pagination */}
              <div className="d-flex justify-content-center p-3 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${
                      currentPage === i + 1
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && !loading && (
                <div className="text-center p-4 text-muted">
                  No data found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}