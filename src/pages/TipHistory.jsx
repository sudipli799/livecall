import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";

export default function TipsHistory() {
  const { user } = useSelector((state) => state.auth);

  const [tipsData, setTipsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

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

  // ================= SEARCH FILTER =================

  const filteredTips = tipsData.filter((tip) =>
    `${tip.sender_name} ${tip.msg} ${tip.type} ${tip.token}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= PAGINATION =================

  const totalPages = Math.ceil(filteredTips.length / recordsPerPage);

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentTips = filteredTips.slice(indexOfFirst, indexOfLast);

  const changePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <CreatorSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "radial-gradient(circle at top,#f9fafb,#e5e7eb)"
          }}
        >

          {/* HEADER */}
          <div className="d-flex justify-content-between mb-4">

            <div>
              <h2 className="fw-bold">💎 Tips History</h2>
              <small className="text-muted">
                All tips received from users
              </small>
            </div>

            {/* SEARCH */}
            <div style={{ width: 250 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search tips..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

          </div>

          {/* TABLE */}
          <div className="card border-0 rounded-4 shadow-lg">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                🧾 Recent Tips
              </h5>

              {loading ? (
                <div className="text-center py-4">
                  Loading tips...
                </div>
              ) : (
                <>
                  <div className="table-responsive">

                    <table className="table table-hover align-middle">

                      <thead className="table-light">
                        <tr>
                          <th>SN</th>
                          <th>Sender</th>
                          <th>Message</th>
                          <th>Type</th>
                          <th>Tokens</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>

                        {currentTips.length > 0 ? (
                          currentTips.map((tip, index) => (

                            <tr key={tip._id}>

                              <td>
                                {(currentPage - 1) * recordsPerPage + index + 1}
                              </td>

                              <td className="fw-semibold">
                                {tip.sender_name || "Unknown"}
                              </td>

                              <td>
                                {tip.msg}
                              </td>

                              <td>
                                <span
                                  className={`badge ${
                                    tip.type === "Tip"
                                      ? "bg-danger"
                                      : "bg-primary"
                                  }`}
                                >
                                  {tip.type}
                                </span>
                              </td>

                              <td className="text-success fw-bold">
                                +{tip.token} tk
                              </td>

                              <td className="text-muted">
                                {new Date(tip.date).toLocaleString()}
                              </td>

                            </tr>

                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              No tips found
                            </td>
                          </tr>
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* PAGINATION */}

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">

                      <nav>
                        <ul className="pagination">

                          <li
                            className={`page-item ${
                              currentPage === 1 && "disabled"
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                changePage(currentPage - 1)
                              }
                            >
                              Previous
                            </button>
                          </li>

                          {[...Array(totalPages)].map((_, i) => (

                            <li
                              key={i}
                              className={`page-item ${
                                currentPage === i + 1 && "active"
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  changePage(i + 1)
                                }
                              >
                                {i + 1}
                              </button>
                            </li>

                          ))}

                          <li
                            className={`page-item ${
                              currentPage === totalPages &&
                              "disabled"
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                changePage(currentPage + 1)
                              }
                            >
                              Next
                            </button>
                          </li>

                        </ul>
                      </nav>

                    </div>
                  )}

                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}