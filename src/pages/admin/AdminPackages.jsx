import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../../components/CreatorSidebar";

export default function AdminPackages() {
  const [search, setSearch] = useState("");

  // STATIC DATA
  const packages = [
    {
      id: 1,
      name: "Starter Pack",
      tokens: 100,
      price: 99,
      bonus: 10,
    },
    {
      id: 2,
      name: "Silver Pack",
      tokens: 500,
      price: 449,
      bonus: 75,
    },
    {
      id: 3,
      name: "Gold Pack",
      tokens: 1000,
      price: 799,
      bonus: 200,
    },
  ];

  const filtered = packages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
            <h2 className="fw-bold">🎁 Token Packages</h2>

            <div className="d-flex gap-3">
              <input
                type="text"
                placeholder="Search package..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="btn btn-success">
                ➕ Add Package
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="card border-0 rounded-4 shadow-lg">
            <div className="card-body">

              <div className="table-responsive">
                <table className="table align-middle">

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Package</th>
                      <th>Tokens</th>
                      <th>Price (₹)</th>
                      <th>Bonus</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{p.name}</td>

                        <td>{p.tokens} 💎</td>

                        <td className="fw-bold text-success">
                          ₹{p.price}
                        </td>

                        <td className="text-primary">
                          +{p.bonus}
                        </td>

                        {/* ACTION */}
                        <td>
                          <button className="btn btn-sm btn-primary me-2">
                            ✏️ Edit
                          </button>
                          <button className="btn btn-sm btn-danger">
                            🗑 Delete
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