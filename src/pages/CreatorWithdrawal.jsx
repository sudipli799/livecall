import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";

export default function CreatorWithdrawal() {
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalData, setWithdrawalData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const perPage = 6;

  const handleWithdraw = async () => {
    try {
        if (!amount || amount <= 0) {
        alert("Enter valid amount");
        return;
        }

        const payload = {
        user_id: user?._id,
        amount: Number(amount),
        };

        const res = await axiosInstance.post(
        ENDPOINTS.WITHDRAWALREQUEST,
        payload
        );

        if (res?.data?.success) {
        alert("Withdrawal Request Submitted ✅");

        setAmount("");        // input clear
        fetchWithdrawal();    // 🔥 refresh data
        }

    } catch (error) {
        console.log("Withdraw error", error);
        alert(error?.response?.data?.message || "Something went wrong");
    }
    };
  // ✅ FETCH API
  const fetchWithdrawal = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `${ENDPOINTS.WITHDRAWALHISTORY}/${user?._id}`
      );

      if (res?.data?.success) {
        setWithdrawalData(res.data.data);
        setStats(res.data.stats); // ✅ IMPORTANT
      }

    } catch (error) {
      console.log("Error fetching withdrawal", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchWithdrawal();
    }
  }, [user]);

  // ✅ FILTER
  const filtered = withdrawalData.filter((item) =>
    (item.user_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ✅ PAGINATION
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <CreatorSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{ background: "linear-gradient(135deg,#eef2ff,#f8fafc)" }}>

          <h2 className="fw-bold mb-4">💸 Withdrawal Panel</h2>

          {/* 🔥 CARDS (DYNAMIC) */}
          <div className="row g-3 mb-4">

            <Card title="Available Balance" value={stats?.availableAmount || 0} gradient="linear-gradient(135deg,#22c55e,#16a34a)" />
            
            <Card title="Total Earning" value={
                    Number(stats?.availableAmount || 0) + 
                    Number(stats?.totalWithdrawal || 0)
                } gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
            
            <Card title="Total Withdrawal" value={stats?.totalWithdrawal || 0} gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
            
            <Card title="Today Earning" value={stats?.todayEarning || 0} gradient="linear-gradient(135deg,#ec4899,#db2777)" />
            
            <Card title="Today Withdrawal" value={stats?.todayWithdrawal || 0} gradient="linear-gradient(135deg,#ef4444,#dc2626)" />
            
            <Card title="Wallet Balance" value={stats?.wallet || 0} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" />

          </div>

          {/* 💳 WITHDRAW FORM */}
          <div className="card border-0 rounded-4 p-4 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}>

            <h5 className="mb-3 fw-semibold">💰 Withdraw Amount</h5>

            <div className="d-flex gap-3 flex-wrap">
              <input
                type="number"
                placeholder="Enter amount"
                className="form-control rounded-pill"
                style={{ maxWidth: 250 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

                <button
                    className="btn btn-dark rounded-pill px-4"
                    onClick={handleWithdraw}
                    disabled={!amount || loading}
                    >
                    {loading ? "Processing..." : "Withdraw"}
                </button>
            </div>
          </div>

          {/* 🔍 SEARCH */}
          <div className="card border-0 rounded-4 p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}>

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
          </div>

          {/* 📊 TABLE */}
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div style={{
              height: 5,
              background: "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)",
            }} />

            <div className="card-body p-0">

              {loading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0 overflow-hidden">

                    <thead className="text-white"
                      style={{
                        background: "linear-gradient(90deg,#6366f1,#4f46e5,#ec4899)",
                      }}>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment ID</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.map((item, i) => (
                        <tr
                          key={item._id}
                          style={{ transition: "all 0.2s ease" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.transform = "scale(1.01)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
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
                                <div className="fw-semibold">{item.user_name}</div>
                                <small>{item.user_email}</small>
                              </div>
                            </div>
                          </td>

                          <td className="fw-bold text-success">
                            💰 {item.amount}
                          </td>

                          <td>
                            <span className={`badge ${
                              item.status === "Success"
                                ? "bg-success-subtle text-success"
                                : item.status === "Pending"
                                ? "bg-warning-subtle text-warning"
                                : "bg-danger-subtle text-danger"
                            }`}>
                              {item.status}
                            </span>
                          </td>

                          <td style={{ fontSize: 12 }}>
                            {item.payment_id}
                          </td>

                          <td style={{ fontSize: 13 }}>
                            {new Date(item.date).toLocaleString()}
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

// 🔥 CARD
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