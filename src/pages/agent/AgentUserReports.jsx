import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AgentSidebar from "../../components/AgentSidebar";

export default function AgentUserReports() {

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const dummy = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      name: "User " + (i + 1),
      email: `user${i + 1}@mail.com`,
      totalRecharge: Math.floor(Math.random() * 5000),
      totalUsage: Math.floor(Math.random() * 3000),
      balance: Math.floor(Math.random() * 2000),
      joinDate: new Date(
        2026,
        3,
        Math.floor(Math.random() * 28) + 1
      ).toISOString(),
      image: `https://i.pravatar.cc/150?u=${i}`
    }));

    setReports(dummy);
  }, []);

  // FILTER
  const filtered = reports.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const date = new Date(r.joinDate);

    const matchFrom = fromDate ? date >= new Date(fromDate) : true;
    const matchTo = toDate ? date <= new Date(toDate) : true;

    return matchSearch && matchFrom && matchTo;
  });

  // PAGINATION
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  // TOTAL STATS
  const totalRecharge = filtered.reduce((a, b) => a + b.totalRecharge, 0);
  const totalUsage = filtered.reduce((a, b) => a + b.totalUsage, 0);
  const totalBalance = filtered.reduce((a, b) => a + b.balance, 0);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <AgentSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
          }}
        >

          {/* HEADER */}
          <div className="mb-4">
            <h2 className="fw-bold">📄 User Reports</h2>
            <small className="text-muted">
              Analytics & performance overview
            </small>
          </div>

          {/* 🔥 STATS CARDS */}
          <div className="row g-4 mb-4">

            {[
              ["Total Recharge", totalRecharge, "💰", "#22c55e"],
              ["Total Usage", totalUsage, "📉", "#f59e0b"],
              ["Total Balance", totalBalance, "💳", "#3b82f6"],
            ].map(([title, value, icon, color], i) => (

              <div className="col-md-4" key={i}>
                <div
                  className="card text-white border-0 h-100"
                  style={{
                    borderRadius: 20,
                    background: `linear-gradient(135deg,${color},#020617)`,
                    boxShadow: "0 10px 30px rgba(0,0,0,.25)"
                  }}
                >
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small opacity-75">{title}</div>
                      <h4 className="fw-bold">₹{value}</h4>
                    </div>
                    <div style={{ fontSize: 30 }}>{icon}</div>
                  </div>
                </div>
              </div>

            ))}

          </div>

          {/* 🔍 FILTER BAR */}
          <div
            className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 25px rgba(0,0,0,.08)",
            }}
          >
            <div className="d-flex flex-wrap gap-3 align-items-center">

              <input
                type="text"
                placeholder="🔍 Search user..."
                className="form-control rounded-pill"
                style={{ maxWidth: 220 }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <input
                type="date"
                className="form-control rounded-pill"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />

              <input
                type="date"
                className="form-control rounded-pill"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />

              <button className="btn btn-dark rounded-pill px-4">
                📥 Export
              </button>

            </div>
          </div>

          {/* 📊 TABLE */}
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div style={{
              height: 5,
              background:
                "linear-gradient(90deg,#22c55e,#3b82f6,#ec4899)",
            }} />

            <div className="card-body p-0">

              <div className="table-responsive">
                <table className="table align-middle mb-0">

                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Recharge</th>
                      <th>Usage</th>
                      <th>Balance</th>
                      <th>Join</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((r, i) => (
                      <tr key={r.id} style={{ cursor: "pointer" }}>

                        <td>{indexOfFirst + i + 1}</td>

                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={r.image}
                              style={{
                                width: 45,
                                height: 45,
                                borderRadius: "50%",
                                objectFit: "cover"
                              }}
                            />
                            <div>
                              <div className="fw-semibold">
                                {r.name}
                              </div>
                              <small className="text-muted">
                                {r.email}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="text-success fw-bold">
                          ₹{r.totalRecharge}
                        </td>

                        <td className="text-warning fw-bold">
                          ₹{r.totalUsage}
                        </td>

                        <td className="text-primary fw-bold">
                          ₹{r.balance}
                        </td>

                        <td>
                          {new Date(r.joinDate).toLocaleDateString()}
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