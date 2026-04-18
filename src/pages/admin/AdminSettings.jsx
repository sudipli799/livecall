import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../../components/CreatorSidebar";

export default function AdminSettings() {

  // STATIC STATE
  const [commission, setCommission] = useState(20);
  const [minWithdraw, setMinWithdraw] = useState(1000);
  const [maxDaily, setMaxDaily] = useState(5000);
  const [maintenance, setMaintenance] = useState(false);

  const handleSave = () => {
    alert("Settings Saved (Static)");
  };

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
            <h2 className="fw-bold">⚙️ Admin Settings</h2>
            <small className="text-muted">
              Control your platform settings
            </small>
          </div>

          {/* SETTINGS CARD */}
          <div className="card border-0 rounded-4 shadow-lg">
            <div className="card-body">

              <div className="row g-4">

                {/* COMMISSION */}
                <div className="col-md-4">
                  <label className="fw-semibold">
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={commission}
                    onChange={(e) =>
                      setCommission(e.target.value)
                    }
                  />
                </div>

                {/* MIN WITHDRAW */}
                <div className="col-md-4">
                  <label className="fw-semibold">
                    Min Withdraw (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={minWithdraw}
                    onChange={(e) =>
                      setMinWithdraw(e.target.value)
                    }
                  />
                </div>

                {/* MAX DAILY */}
                <div className="col-md-4">
                  <label className="fw-semibold">
                    Max Daily Tokens
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={maxDaily}
                    onChange={(e) =>
                      setMaxDaily(e.target.value)
                    }
                  />
                </div>

                {/* MAINTENANCE MODE */}
                <div className="col-md-6 d-flex align-items-center mt-3">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={maintenance}
                    onChange={() =>
                      setMaintenance(!maintenance)
                    }
                  />
                  <label className="fw-semibold">
                    Enable Maintenance Mode 🚧
                  </label>
                </div>

              </div>

              {/* SAVE BUTTON */}
              <div className="mt-4">
                <button
                  className="btn btn-danger px-4"
                  onClick={handleSave}
                >
                  Save Settings
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}