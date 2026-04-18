import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../../components/CreatorSidebar";

export default function AdminReports() {
  const [search, setSearch] = useState("");

  // STATIC DATA
  const reports = [
    {
      id: 1,
      reporter: "Rahul",
      reported: "Anjali Live",
      reason: "Inappropriate content",
      status: "pending",
      date: "Today",
    },
    {
      id: 2,
      reporter: "Amit",
      reported: "Riya Star",
      reason: "Spam",
      status: "resolved",
      date: "Yesterday",
    },
    {
      id: 3,
      reporter: "Neha",
      reported: "User123",
      reason: "Abusive language",
      status: "pending",
      date: "Today",
    },
  ];

  const filtered = reports.filter((r) =>
    r.reported.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">🚫 Reports & Abuse</h2>

            <input
              type="text"
              placeholder="Search reported user..."
              className="form-control w-25"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* TABLE */}
          <div className="card border-0 rounded-4 shadow-lg">
            <div className="card-body">

              <div className="table-responsive">
                <table className="table align-middle">

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Reporter</th>
                      <th>Reported</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>{r.reporter}</td>
                        <td className="fw-semibold">{r.reported}</td>

                        <td>{r.reason}</td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`badge ${
                              r.status === "resolved"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        <td>{r.date}</td>

                        {/* ACTION */}
                        <td>
                          <button className="btn btn-sm btn-danger me-2">
                            🚫 Ban
                          </button>
                          <button className="btn btn-sm btn-secondary">
                            Ignore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}