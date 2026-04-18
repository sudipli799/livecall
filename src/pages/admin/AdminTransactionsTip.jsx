import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";

export default function AdminTransactionsTip() {
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
      const res = await axiosInstance.get(`${ENDPOINTS.TIPTRANSECTION}`);
      if (res?.data?.success) {
        setTipsData(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching tips", error);
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

  // ✅ STATS (UPDATED)
  const stats = tipsData.reduce(
    (acc, tx) => {
      const amount = Number(tx.token || 0);

      // ALL
      acc.all += amount;
      acc.totalCount += 1;
      acc.maxTx = Math.max(acc.maxTx, amount);

      if (tx.type === "Tip") acc.allTip += amount;
      if (tx.type === "Toy") acc.allToy += amount;
      if (tx.type === "Private") acc.allPrivate += amount;
      if (tx.type === "Exclusive") acc.allExclusive += amount;

      // TODAY
      if (isToday(tx.date)) {
        acc.today += amount;
        acc.todayCount += 1;
        acc.todayMaxTx = Math.max(acc.todayMaxTx, amount);

        if (tx.type === "Tip") acc.todayTip += amount;
        if (tx.type === "Toy") acc.todayToy += amount;
        if (tx.type === "Private") acc.todayPrivate += amount;
        if (tx.type === "Exclusive") acc.todayExclusive += amount;
      }

      return acc;
    },
    {
      today: 0,
      todayTip: 0,
      todayToy: 0,
      todayPrivate: 0,
      todayExclusive: 0,

      all: 0,
      allTip: 0,
      allToy: 0,
      allPrivate: 0,
      allExclusive: 0,

      totalCount: 0,
      todayCount: 0,
      maxTx: 0,
      todayMaxTx: 0,
    }
  );

  // FILTER
  const filtered = tipsData.filter((tx) => {
    const matchSearch =
      (tx.sender_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.receiver_name || "").toLowerCase().includes(search.toLowerCase());

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

  // 🎨 PREMIUM CARD STYLE
  const cardStyle = (gradient) => ({
    background: gradient,
    color: "#fff",
    borderRadius: "16px",
    padding: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: "0.3s",
  });

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
          <div className="mb-4">
            <h2 className="fw-bold">💰 Tip Transactions</h2>
          </div>

          {/* 🔥 PREMIUM CARDS */}
          <div className="row g-3 mb-4">

            {/* TODAY */}
            <Card title="Today Total" value={stats.today} gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
            <Card title="Today Tip" value={stats.todayTip} gradient="linear-gradient(135deg,#22c55e,#16a34a)" />
            <Card title="Today Toy" value={stats.todayToy} gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
            <Card title="Today Private" value={stats.todayPrivate} gradient="linear-gradient(135deg,#ec4899,#db2777)" />
            <Card title="Today Exclusive" value={stats.todayExclusive} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" />
            {/* <Card title="Today Txn" value={stats.todayCount} gradient="linear-gradient(135deg,#0ea5e9,#2563eb)" /> */}
            <Card title="Today Highest" value={stats.todayMaxTx} gradient="linear-gradient(135deg,#f43f5e,#e11d48)" />

            {/* ALL */}
            <Card title="All Total" value={stats.all} gradient="linear-gradient(135deg,#111827,#374151)" />
            <Card title="All Tip" value={stats.allTip} gradient="linear-gradient(135deg,#22c55e,#15803d)" />
            <Card title="All Toy" value={stats.allToy} gradient="linear-gradient(135deg,#f59e0b,#b45309)" />
            <Card title="All Private" value={stats.allPrivate} gradient="linear-gradient(135deg,#ec4899,#9d174d)" />
            <Card title="All Exclusive" value={stats.allExclusive} gradient="linear-gradient(135deg,#06b6d4,#155e75)" />
            {/* <Card title="All Txn" value={stats.totalCount} gradient="linear-gradient(135deg,#6366f1,#1e3a8a)" /> */}
            <Card title="All Highest" value={stats.maxTx} gradient="linear-gradient(135deg,#f43f5e,#881337)" />

          </div>

          {/* FILTER */}
          <div
            className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}
          >
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
              background:
                "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
            }} />

            <div className="card-body p-0">

              <div className="table-responsive" style={{ overflowX: "hidden" }}>

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
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Amount</th>
                      <th>Message</th>
                      <th>Type</th>
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

                        <td className="fw-semibold">
                          {tx.sender_name || "-"}
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={
                                tx.receiver_image ||
                                "https://i.pravatar.cc/100"
                              }
                              alt=""
                              style={{
                                width: 35,
                                height: 35,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <span className="fw-semibold">
                              {tx.receiver_name || "-"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="fw-bold text-success">
                            💰 {tx.token}
                          </span>
                        </td>

                        <td>{tx.msg}</td>

                        <td>
                          <span className="badge bg-primary-subtle text-primary">
                            {tx.type}
                          </span>
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

// ✅ REUSABLE CARD
const Card = ({ title, value, gradient }) => (
  <div className="col-6 col-md-3 col-lg-2">
    <div
      style={{
        background: gradient,
        color: "#fff",
        borderRadius: "16px",
        padding: "15px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: "bold" }}>
        💰 {value}
      </div>
    </div>
  </div>
);