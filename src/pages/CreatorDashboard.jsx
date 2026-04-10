import React, { useState, useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useSelector, useDispatch } from "react-redux";
import { updateToken, getLiveStatus } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS  from "../api/endpoints";
// import { getLiveStatus } from "../redux/slices/authSlice";


export default function CreatorDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // const [dailyLimit, setDailyLimit] = useState(5000);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState(null);
  const [wallet, setWallet] = useState(5000);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [tokenDate, setTokenDate] = useState(null);
  const [getDailyLimit, setGetDailyLimit] = useState(0);

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

const fetchMyData = async () => {
  try {

    const response = await dispatch(
      getLiveStatus({ token })
    );

    const data = response.payload;

    console.log("Live Status:", data);

    if (!data.success) return;

    const user = data.user;

    // user data store
    setUserData(user);

    // specific fields store
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


useEffect(() => {
  fetchMyData();
}, []);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
    {/* <p>Wallet: {wallet}</p>
<p>Daily Limit: {dailyLimit}</p>
<p>Token Date: {tokenDate}</p>
<p>Used Today: {getDailyLimit}</p> */}
        {/* SIDEBAR */}
        <CreatorSidebar />

        {/* MAIN */}
        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background:
              "radial-gradient(circle at top,#f9fafb,#e5e7eb)",
          }}
        >
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>
              <h2 className="fw-bold mb-0">
                Welcome, {user?.name} 👋
              </h2>
              <small className="text-muted">
                Creator Dashboard
              </small>
            </div>

            <div className="d-flex gap-3 align-items-center">

              <div
                className="px-4 py-2 fw-bold text-white rounded-pill"
                style={{
                  background:
                    "linear-gradient(135deg,#ec4899,#db2777)",
                }}
              >
                💼 ₹{wallet}
              </div>

              <button className="btn btn-danger fw-semibold rounded-pill px-4 shadow">
                🔴 Go Live
              </button>

            </div>
          </div>

          {/* ================= STATS ================= */}

          <div className="row g-4 mb-4">

            {[
              ["Today Earnings", `₹${getDailyLimit}`, "💸", "#ec4899"],
              ["This Month", "₹38,900", "📅", "#8b5cf6"],
              ["Total Tips", "1,245 💎", "💎", "#22c55e"],
              ["Viewers", "128 👥", "👀", "#f97316"],
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
                        <h4 className="fw-bold">{value}</h4>
                      </div>

                      <div style={{ fontSize: 30 }}>
                        {icon}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            ))}

          </div>

          {/* ================= GOAL + LIVE ================= */}

          <div className="row g-4 mb-4">

            {/* TIP GOAL */}
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-lg">
                <div className="card-body">

                  <h6 className="fw-bold">
                    🎯 Tip Goal
                  </h6>

                  <div className="progress my-3" style={{ height: 12 }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <small className="text-muted">
                    {progress.toFixed(0)}% Completed 
                    ({getDailyLimit} / {dailyLimit} tokens)
                  </small>

                </div>
              </div>
            </div>

            {/* LIVE STATUS */}
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-lg">
                <div className="card-body">

                  <h6 className="fw-bold">
                    🔴 Live Status
                  </h6>

                  <span className="badge bg-success px-3 py-2 rounded-pill">
                    Online
                  </span>

                  <p className="mt-2 text-muted">
                    Stream Time: 01h 24m
                  </p>

                </div>
              </div>
            </div>

          </div>

          {/* ================= DAILY LIMIT ================= */}

          <div className="card border-0 rounded-4 shadow-lg mb-4">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5 className="fw-bold">
                  📊 Daily Token Limit
                </h5>

                <span className="badge bg-dark">
                  Current Limit: {dailyLimit} tokens
                </span>

              </div>

              <div className="row">

                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter daily token limit"
                    value={dailyLimit}
                    onChange={(e) =>
                      setDailyLimit(e.target.value)
                    }
                  />
                  {isTodayToken() && (
                    <div className="text-danger mt-2">
                      ⚠️ Daily limit already set for today
                    </div>
                  )}
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-danger w-100"
                    onClick={saveDailyLimit}
                    disabled={isTodayToken()}
                  >
                    {loading
                      ? "Saving..."
                      : "Save"}
                  </button>
                </div>

                <div className="col-md-6">

                  <div className="alert alert-light mb-0">

                    💡 Creator live automatically stop ho jayega
                    jab daily token limit reach ho jayegi.

                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* ================= RECENT ACTIVITY ================= */}

          <div className="card border-0 rounded-4 shadow-lg">

            <div className="card-body">

              <h6 className="fw-bold mb-3">
                🧾 Recent Activity
              </h6>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>anukrn tipped 💎</span>
                <span className="fw-semibold text-success">
                  +50 tk
                </span>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Private show started 🔒</span>
                <span>24 tk/min</span>
              </div>

              <div className="d-flex justify-content-between py-2">
                <span>New fan followed ❤️</span>
                <span>Just now</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}