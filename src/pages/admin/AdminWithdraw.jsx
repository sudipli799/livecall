import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminWithdraw() {
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalData, setWithdrawalData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const perPage = 6;

  const handleApprove = async (id) => {
  try {
    const res = await axiosInstance.put(
      `${ENDPOINTS.UPDATEWITHDRAWAL}/${id}/Success`
    );

    if (res?.data?.success) {
      alert("Payment Approved ✅");
      fetchWithdrawal(); // refresh
    }

  } catch (error) {
    console.log("Approve error", error);
    alert(error?.response?.data?.message || "Failed to approve");
  }
};

  // ✅ FETCH ADMIN DATA
  const fetchWithdrawal = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        ENDPOINTS.ADMINWITHDRAWALREQUEST
      );

      if (res?.data?.success) {
        setWithdrawalData(res.data.data);
        setStats(res.data.stats);
      }

    } catch (error) {
      console.log("Error fetching withdrawal", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawal();
  }, []);

  

  // ✅ FILTER (SEARCH + STATUS)
  const filtered = withdrawalData.filter((item) => {
    const matchSearch = (item.user_name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ✅ PAGINATION
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <AdminSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{ background: "linear-gradient(135deg,#eef2ff,#f8fafc)" }}
        >
          <h2 className="fw-bold mb-4">💸 Admin Withdrawal Panel</h2>

          {/* 🔥 STATS CARDS */}
          <div className="row g-3 mb-4">

            <Card title="Total Revenue" value={stats?.totalRevenue || 0} gradient="linear-gradient(135deg,#22c55e,#16a34a)" />

            <Card title="Total Commission" value={stats?.totalCommission || 0} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" />

            <Card title="Total Withdrawal" value={stats?.totalWithdrawal || 0} gradient="linear-gradient(135deg,#f59e0b,#d97706)" />

            <Card title="Today Withdrawal" value={stats?.todayWithdrawal || 0} gradient="linear-gradient(135deg,#ef4444,#dc2626)" />

            <Card title="Pending Payments" value={stats?.pendingPayments || 0} gradient="linear-gradient(135deg,#ec4899,#db2777)" />

            <Card title="Completed Amount" value={stats?.completedAmount || 0} gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />

          </div>

          {/* 🔍 SEARCH + FILTER */}
          <div
            className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}
          >
            <div className="d-flex gap-3 flex-wrap">

              <input
                type="text"
                placeholder="🔍 Search user..."
                className="form-control rounded-pill"
                style={{ maxWidth: 250 }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                className="form-select rounded-pill"
                style={{ maxWidth: 180 }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>

            </div>
          </div>

          {/* 📊 TABLE */}
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div
              style={{
                height: 5,
                background:
                  "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
              }}
            />

            <div className="card-body p-0">

              {loading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
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
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment ID</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.map((item, i) => (
                        <tr key={item._id}>
                          <td>{indexOfFirst + i + 1}</td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={item.user_image}
                                alt=""
                                style={{
                                  width: 35,
                                  height: 35,
                                  borderRadius: "50%",
                                }}
                              />
                              <div>
                                <div className="fw-semibold">
                                  {item.user_name}
                                </div>
                                <small>{item.user_email}</small>
                              </div>
                            </div>
                          </td>

                          <td className="fw-bold text-success">
                            💰 {item.amount}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                item.status === "Success"
                                  ? "bg-success-subtle text-success"
                                  : item.status === "Pending"
                                  ? "bg-warning-subtle text-warning"
                                  : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td style={{ fontSize: 12 }}>
                            {item.payment_id}
                          </td>

                          <td style={{ fontSize: 13 }}>
                            {new Date(item.date).toLocaleString()}
                          </td>

                          <td>
                            {item.status === "Pending" ? (
                              <button
                                className="btn btn-sm btn-success rounded-pill"
                                onClick={() => handleApprove(item._id)}
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="text-muted">Done</span>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

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

// 🔥 CARD COMPONENT
const Card = ({ title, value, gradient }) => (
  <div className="col-6 col-md-2">
    <div
      style={{
        background: gradient,
        color: "#fff",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 5 }}>
        💰 {value}
      </div>
    </div>
  </div>
);