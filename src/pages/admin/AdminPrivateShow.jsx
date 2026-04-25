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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `${ENDPOINTS.ADMINREQUEST}`
      );

      if (res?.data?.data) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching requests", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <CreatorSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
          }}
        >

          <div className="mb-4">
            <h2 className="fw-bold mb-1">🎥 Show Requests</h2>
          </div>

          {loading && (
            <div className="text-center my-3">
              ⏳ Loading requests...
            </div>
          )}

          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div style={{
              height: 5,
              background:
                "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
            }} />

            <div className="card-body p-0">

              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead className="text-white"
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
                      <th>Duration (min)</th>
                      <th>Total Token</th>
                      
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((req, i) => {

                      // ✅ seconds → minutes (ceil)
                      const minutes = Math.ceil((req.duration || 0) / 60);

                      // ✅ total token
                      const total = minutes * (req.token || 0);

                      return (
                        <tr key={req._id}>

                          <td>{i + 1}</td>

                          {/* USER */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={req.sender_id?.profileImage}
                                alt=""
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  objectFit: "cover",
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
                            <span className="badge bg-info">
                              {req.type}
                            </span>
                          </td>

                          <td>💰 {req.token}</td>

                          {/* STATUS */}
                          <td>
                            <span className={`badge ${
                              req.status === "Pending"
                                ? "bg-warning text-dark"
                                : req.status === "started"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}>
                              {req.status}
                            </span>
                          </td>

                          {/* DURATION */}
                          <td>
                            {minutes} min
                          </td>

                          {/* TOTAL */}
                          <td className="fw-bold text-success">
                            💸 {total}
                          </td>

                          {/* ACTION */}
                          

                          <td>
                            {new Date(req.createdAt).toLocaleString()}
                          </td>

                          <td>
                            {req.status === "Pending" && (
                                <button
                                className="btn btn-sm btn-primary rounded-pill"
                                onClick={() => navigate(`/private-show-creator/${req._id}`)}
                                >
                                ▶ Start Call
                                </button>
                            )}

                            {req.status === "started" && (
                                <button
                                className="btn btn-sm btn-success rounded-pill"
                                onClick={() => navigate(`/private-show-creator/${req._id}`)}
                                >
                                🟢 On Going
                                </button>
                            )}

                            {req.status === "completed" && (
                                <button className="btn btn-sm btn-secondary rounded-pill">
                                ✔ Completed
                                </button>
                            )}
                            </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>

              {requests.length === 0 && !loading && (
                <div className="text-center p-4 text-muted">
                  No show requests found
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}