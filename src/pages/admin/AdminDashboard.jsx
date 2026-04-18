import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";

export default function AdminDashboard() {

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 6;

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(ENDPOINTS.ADMINDASHBOARD);

      if (res?.data) {
        setStats(res.data.stats || {});
        setTransactions(res.data.recentTransactions || []);
      }

    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH
  const filteredTransactions = transactions.filter((t) =>
    t.user?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ PAGINATION
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / perPage);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <AdminSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
          }}
        >

          {/* HEADER */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1">📊 Admin Dashboard</h2>
            <small className="text-muted">
              Platform analytics & revenue insights
            </small>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="text-center my-3">⏳ Loading...</div>
          )}

          {/* ================= STATS ================= */}

          <div className="row g-4 mb-4">

            {[
              ["Total Users", stats.totalUsers, "👥", "#3b82f6"],
              ["Creators", stats.totalCreators, "🎥", "#8b5cf6"],
              ["Revenue", `₹${stats.totalRevenue}`, "💰", "#22c55e"],
              ["Live Users", stats.liveUsers, "🔴", "#ef4444"],
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
                        <h4 className="fw-bold">{value || 0}</h4>
                      </div>
                      <div style={{ fontSize: 30 }}>{icon}</div>
                    </div>
                  </div>
                </div>
              </div>

            ))}

          </div>

          {/* EXTRA CARDS */}
          <div className="row g-4 mb-4">

            <div className="col-md-3">
              <div className="card p-3 rounded-4 shadow">
                <h6>Total Wallet</h6>
                <h5>₹{stats.totalWallet || 0}</h5>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 rounded-4 shadow">
                <h6>Total Commission</h6>
                <h5>₹{stats.totalCommission || 0}</h5>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 rounded-4 shadow">
                <h6>Total Tips</h6>
                <h5>₹{stats.totalTips || 0}</h5>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 rounded-4 shadow">
                <h6>Total Withdrawal</h6>
                <h5>₹{stats.totalWithdrawal || 0}</h5>
              </div>
            </div>

          </div>

          {/* ================= SEARCH ================= */}

          <div className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              className="form-control rounded-pill px-3"
              style={{ maxWidth: 250 }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* ================= TABLE ================= */}

          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div style={{
              height: 5,
              background:
                "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
            }} />

            <div className="card-body p-0">

              <div className="table-responsive">
                <table className="table align-middle mb-0">

                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {currentData.length > 0 ? (
                      currentData.map((t, i) => (

                        <tr key={t._id}>

                          <td>{indexOfFirst + i + 1}</td>

                          {/* ✅ USER WITH IMAGE + EMAIL */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={t.image || "https://i.pravatar.cc/100"}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  objectFit: "cover"
                                }}
                              />
                              <div>
                                <div className="fw-semibold">
                                  {t.user}
                                </div>
                                <small className="text-muted">
                                  {t.email}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>₹{t.amount}</td>

                          {/* ✅ STATUS FIX */}
                          <td>
                            <span className={`badge px-3 py-2 rounded-pill ${
                              t.status === "Credit"
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            }`}>
                              {t.status}
                            </span>
                          </td>

                          <td>
                            {new Date(t.date).toLocaleString()}
                          </td>

                        </tr>

                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No data found
                        </td>
                      </tr>
                    )}

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