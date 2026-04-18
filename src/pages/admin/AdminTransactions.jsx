import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../../components/CreatorSidebar";

export default function AdminTransactions() {
  const [search, setSearch] = useState("");

  // STATIC DATA
  const transactions = [
    {
      id: 1,
      user: "Rahul Sharma",
      amount: 500,
      type: "Tip",
      status: "success",
      date: "Today",
    },
    {
      id: 2,
      user: "Amit Verma",
      amount: 1200,
      type: "Recharge",
      status: "pending",
      date: "Today",
    },
    {
      id: 3,
      user: "Neha Singh",
      amount: 300,
      type: "Tip",
      status: "failed",
      date: "Yesterday",
    },
    {
      id: 4,
      user: "Priya Patel",
      amount: 2000,
      type: "Recharge",
      status: "success",
      date: "Yesterday",
    },
  ];

  const filteredTx = transactions.filter((tx) =>
    tx.user.toLowerCase().includes(search.toLowerCase())
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
            <h2 className="fw-bold">💰 Transactions</h2>

            <input
              type="text"
              placeholder="Search user..."
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
                      <th>User</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTx.map((tx, i) => (
                      <tr key={tx.id}>
                        <td>{i + 1}</td>
                        <td>{tx.user}</td>

                        <td className="fw-semibold">
                          ₹{tx.amount}
                        </td>

                        <td>{tx.type}</td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`badge ${
                              tx.status === "success"
                                ? "bg-success"
                                : tx.status === "pending"
                                ? "bg-warning"
                                : "bg-danger"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>

                        <td>{tx.date}</td>
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