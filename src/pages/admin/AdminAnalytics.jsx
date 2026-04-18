import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../../components/CreatorSidebar";

export default function AdminAnalytics() {

  // STATIC DATA
  const revenueData = [500, 800, 1200, 900, 1500, 2000, 1700];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const max = Math.max(...revenueData);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

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
          <div className="mb-4">
            <h2 className="fw-bold">📈 Analytics Dashboard</h2>
            <small className="text-muted">
              Platform insights & performance
            </small>
          </div>

          {/* ================= STATS ================= */}

          <div className="row g-4 mb-4">

            {[
              ["Total Revenue", "₹8,45,000", "💰"],
              ["New Users", "1,245", "👤"],
              ["Active Creators", "320", "🎥"],
              ["Live Streams", "128", "🔴"],
            ].map(([title, value, icon], i) => (

              <div className="col-md-3" key={i}>
                <div className="card border-0 shadow-lg rounded-4">
                  <div className="card-body text-center">
                    <div style={{ fontSize: 30 }}>{icon}</div>
                    <h6 className="mt-2">{title}</h6>
                    <h4 className="fw-bold">{value}</h4>
                  </div>
                </div>
              </div>

            ))}

          </div>

          {/* ================= REVENUE CHART ================= */}

          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h6 className="fw-bold mb-3">💰 Weekly Revenue</h6>

              <div className="d-flex align-items-end justify-content-between" style={{ height: 200 }}>

                {revenueData.map((val, i) => (
                  <div key={i} className="text-center">

                    <div
                      style={{
                        height: `${(val / max) * 100}%`,
                        width: 30,
                        background: "linear-gradient(135deg,#3b82f6,#1e3a8a)",
                        borderRadius: 6,
                        marginBottom: 5,
                      }}
                    ></div>

                    <small>{days[i]}</small>

                  </div>
                ))}

              </div>

            </div>
          </div>

          {/* ================= USER GROWTH ================= */}

          <div className="card border-0 rounded-4 shadow-lg">

            <div className="card-body">

              <h6 className="fw-bold mb-3">👥 User Growth</h6>

              <div className="progress mb-3" style={{ height: 12 }}>
                <div className="progress-bar bg-success" style={{ width: "70%" }} />
              </div>

              <small className="text-muted">
                70% increase this month 🚀
              </small>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}