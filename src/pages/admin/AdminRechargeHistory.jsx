import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";

export default function AdminRechargeHistory() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [tipsData, setTipsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const perPage = 6;

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${ENDPOINTS.RECHARGEHISTORY}`);
      if (res?.data?.success) {
        setTipsData(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching recharge history", error);
    } finally {
      setLoading(false);
    }
  };

  const isToday = (date) => {
    const d = new Date(date);
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  // ✅ CLEAN STATS (ONLY USED)
  const stats = tipsData.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount || 0);

      acc.allCredit += tx.type === "Credit" ? amount : 0;
      acc.maxTx = Math.max(acc.maxTx, amount);

      if (isToday(tx.date)) {
        acc.todayCredit += tx.type === "Credit" ? amount : 0;
        acc.todayMaxTx = Math.max(acc.todayMaxTx, amount);
      }

      return acc;
    },
    {
      todayCredit: 0,
      allCredit: 0,
      maxTx: 0,
      todayMaxTx: 0,
    }
  );

  // FILTER
  const filtered = tipsData.filter((tx) => {
    const matchSearch =
      (tx.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.user_email || "").toLowerCase().includes(search.toLowerCase());

    const txDate = new Date(tx.date);

    const matchFrom = fromDate ? txDate >= new Date(fromDate) : true;
    const matchTo = toDate ? txDate <= new Date(toDate) : true;

    return matchSearch && matchFrom && matchTo;
  });

  // PAGINATION
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <AdminSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{ background: "linear-gradient(135deg,#eef2ff,#f8fafc)" }}>

          <div className="mb-4">
            <h2 className="fw-bold">💳 Recharge History</h2>
          </div>

          {/* 🔥 BIG PREMIUM CARDS */}
          <div className="row g-4 mb-4">

            <Card title="Today Credit" value={stats.todayCredit} gradient="linear-gradient(135deg,#22c55e,#16a34a)" />
            <Card title="All Credit" value={stats.allCredit} gradient="linear-gradient(135deg,#22c55e,#15803d)" />
            <Card title="Today Highest" value={stats.todayMaxTx} gradient="linear-gradient(135deg,#f43f5e,#e11d48)" />
            <Card title="All Highest" value={stats.maxTx} gradient="linear-gradient(135deg,#f43f5e,#881337)" />

          </div>

          {/* FILTER */}
          <div className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}>
            <div className="d-flex flex-wrap gap-3">

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

              <input
                type="date"
                className="form-control rounded-pill"
                style={{ maxWidth: 180 }}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <input
                type="date"
                className="form-control rounded-pill"
                style={{ maxWidth: 180 }}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
              />

            </div>
          </div>

          {/* TABLE */}
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div style={{
              height: 5,
              background: "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
            }} />

            <div className="card-body p-0">
              <div className="table-responsive" style={{ overflowX: "hidden" }}>

                <table className="table align-middle mb-0">

                  <thead className="text-white"
                    style={{
                      background: "linear-gradient(90deg,#6366f1,#4f46e5,#ec4899)",
                    }}>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Payment ID</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((tx, i) => (
                      <tr
                        key={tx._id}
                        style={{
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.transform = "scale(1.002)";
                            e.currentTarget.style.boxShadow =
                            "0 8px 18px rgba(0,0,0,0.06)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                        >

                        <td>{indexOfFirst + i + 1}</td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={tx.user_image || "https://i.pravatar.cc/100"}
                              alt=""
                              style={{
                                width: 35,
                                height: 35,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div className="fw-semibold">{tx.user_name}</div>
                              <small>{tx.user_email}</small>
                            </div>
                          </div>
                        </td>

                        <td className="fw-bold text-success">
                          💰 {tx.amount}
                        </td>

                        <td>
                          <span className={`badge ${
                            tx.type === "Credit"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-primary-subtle text-primary">
                            {tx.status}
                          </span>
                        </td>

                        <td style={{ fontSize: 12 }}>
                          {tx.payment_id}
                        </td>

                        <td style={{ fontSize: 13 }}>
                          {new Date(tx.date).toLocaleString()}
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

// ✅ BIG PREMIUM CARD
const Card = ({ title, value, gradient }) => (
  <div className="col-12 col-md-6 col-lg-3">
    <div style={{
      background: gradient,
      color: "#fff",
      borderRadius: "20px",
      padding: "25px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
      textAlign: "center",
      minHeight: "120px",
    }}>
      <div style={{ fontSize: 16, opacity: 0.9 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: "bold", marginTop: 10 }}>
        💰 {value}
      </div>
    </div>
  </div>
);