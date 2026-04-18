import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useSelector, useDispatch } from "react-redux";
import { updateToken, getLiveStatus } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";

export default function CreatorDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState(null);
  const [wallet, setWallet] = useState(5000);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [tokenDate, setTokenDate] = useState(null);
  const [getDailyLimit, setGetDailyLimit] = useState(0);

  // ✅ NEW STATE ADDED (TIPS DATA)
  const [tipsData, setTipsData] = useState([]);

  const saveDailyLimit = async () => {
    try {
      if (!dailyLimit) {
        alert("Enter daily limit");
        return;
      }

      setLoading(true);

      const resultAction = await dispatch(
        updateToken({
          dailyLimit: dailyLimit,
        })
      );

      if (updateToken.fulfilled.match(resultAction)) {
        alert(resultAction.payload.message || "Daily limit updated successfully");
      } else {
        alert(resultAction.payload || "Failed to update");
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // ================= FETCH TIPS (ACTIVE) =================
  const fetchTips = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `${ENDPOINTS.TIPHISTORY}/${user?._id}`
      );

      if (res?.data?.success) {
        setTipsData(res.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.log("Error fetching tips", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchTips();
    }
  }, [user]);

  const fetchMyData = async () => {
    try {
      const response = await dispatch(getLiveStatus({ token }));

      const data = response.payload;

      console.log("Live Status:", data);

      if (!data.success) return;

      const user = data.user;

      setUserData(user);
      setWallet(user.wallet);
      setDailyLimit(user.dailyLimit);
      setTokenDate(user.tokenDate);
      setGetDailyLimit(user.getdailyLimit);
    } catch (err) {
      console.log(err);
    }
  };

  const isTodayToken = () => {
    if (!tokenDate) return false;

    const today = new Date();
    const tokenDay = new Date(tokenDate);

    return (
      today.getFullYear() === tokenDay.getFullYear() &&
      today.getMonth() === tokenDay.getMonth() &&
      today.getDate() === tokenDay.getDate()
    );
  };

  const progress = dailyLimit
    ? Math.min((getDailyLimit / dailyLimit) * 100, 100)
    : 0;

  // ================= NEW CALCULATIONS =================
  const totalTransactions = tipsData?.length || 0;

  const thisMonthEarnings = tipsData
    ?.filter((t) => {
      const date = new Date(t.createdAt);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    ?.reduce((acc, item) => acc + Number(item.token || 0), 0);

  useEffect(() => {
    fetchMyData();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <CreatorSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "radial-gradient(circle at top,#f9fafb,#e5e7eb)",
          }}
        >

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0">
                Welcome, {user?.name} 👋
              </h2>
              <small className="text-muted">Creator Dashboard</small>
            </div>

            <div className="d-flex gap-3 align-items-center">
              <div
                className="px-4 py-2 fw-bold text-white rounded-pill"
                style={{
                  background: "linear-gradient(135deg,#ec4899,#db2777)",
                }}
              >
                💼 ₹{wallet}
              </div>

              <button className="btn btn-danger fw-semibold rounded-pill px-4 shadow">
                🔴 Go Live
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="row g-4 mb-4">
            {[
              ["Today Earnings", `₹${getDailyLimit}`, "💸", "#ec4899"],
              ["This Month", `₹${thisMonthEarnings}`, "📅", "#8b5cf6"],
              ["Total Tips", `${totalTransactions} 💎`, "💎", "#22c55e"],
              ["Wallet", `₹${wallet}`, "👀", "#f97316"],
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
                        <div className="small opacity-75">{title}</div>
                        <h4 className="fw-bold">{value}</h4>
                      </div>
                      <div style={{ fontSize: 30 }}>{icon}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GOAL + LIVE */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-lg">
                <div className="card-body">
                  <h6 className="fw-bold">🎯 Tip Goal</h6>

                  <div className="progress my-3" style={{ height: 12 }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <small className="text-muted">
                    {progress.toFixed(0)}% Completed ({getDailyLimit} / {dailyLimit})
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-lg">
                <div className="card-body">
                  <h6 className="fw-bold">🔴 Live Status</h6>
                  <span className="badge bg-success px-3 py-2 rounded-pill">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DAILY LIMIT */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">
              <h5 className="fw-bold">📊 Daily Token Limit</h5>
              <input
                type="number"
                className="form-control"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />

              <button
                className="btn btn-danger mt-2"
                onClick={saveDailyLimit}
                disabled={isTodayToken()}
              >
                Save
              </button>
            </div>
          </div>

          
          {/* TOP 10 TABLE */}
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body">
              <h5>🏆 Top 10 Transactions</h5>

              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sender</th>
                    <th>Message</th>
                    <th>Tokens</th>
                  </tr>
                </thead>

                <tbody>
                  {tipsData?.slice(0, 10).map((t, i) => (
                    <tr key={t._id}>
                      <td>{i + 1}</td>
                      <td>{t.sender_name}</td>
                      <td>{t.msg}</td>
                      <td>💎 {t.token}</td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}