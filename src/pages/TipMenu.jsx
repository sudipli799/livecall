import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useDispatch, useSelector } from "react-redux";
import { addtip } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS  from "../api/endpoints";

export default function TipMenu() {
  const [activeTab, setActiveTab] = useState("tip");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [emoji, setEmoji] = useState("");
  const [message, setMessage] = useState("");

  const [tips, setTips] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  /*
  ===============================
  FETCH TIPS
  ===============================
  */
  const fetchTips = async () => {
    try {
      const res = await axiosInstance.get(
        `${ENDPOINTS.TIP}/${user?._id}`
      );

      if (res?.data?.data) {
        setTips(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching tips", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchTips();
    }
  }, [user]);

  /*
  ===============================
  ADD TIP OR TOY
  ===============================
  */
  const handleSubmit = async () => {
    if (!title || !amount) {
      setMessage("All fields required");
      return;
    }

    const payload = {
      user_id: user?._id,
      title: `${title} ${emoji}`,
      amount: amount,
      tiptype: activeTab === "tip" ? "Tip" : "Toy",
    };

    try {
      const res = await dispatch(addtip(payload));

      if (res?.payload?.message) {
        setMessage(res.payload.message);

        setTitle("");
        setAmount("");
        setEmoji("");

        fetchTips(); // refresh list
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
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
            <h3 className="fw-bold">💎 Tip & Toys Menu</h3>
            <small className="text-muted">
              Add Tip Menu and Sexy Toys for Users
            </small>
          </div>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {/* TAB BUTTONS */}
          <div className="d-flex gap-3 mb-4">
            <button
              className={`btn ${
                activeTab === "tip"
                  ? "btn-danger"
                  : "btn-outline-danger"
              } rounded-pill px-4`}
              onClick={() => setActiveTab("tip")}
            >
              💎 Tip Menu
            </button>

            <button
              className={`btn ${
                activeTab === "toys"
                  ? "btn-dark"
                  : "btn-outline-dark"
              } rounded-pill px-4`}
              onClick={() => setActiveTab("toys")}
            >
              🔥 Sexy Toys
            </button>
          </div>

          {/* ================= TIP FORM ================= */}
          {activeTab === "tip" && (
            <div className="row">

              {/* FORM */}
              <div className="col-md-5">
                <div className="card border-0 rounded-4 shadow-lg">
                  <div className="card-body">

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Tip Title
                      </label>

                      <div className="input-group">

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tip Title (e.g. Kiss)"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />

                        <select
                          className="form-select"
                          style={{ maxWidth: "120px" }}
                          value={emoji}
                          onChange={(e) => setEmoji(e.target.value)}
                        >
                          <option value="">Icon</option>
                          <option value="💋">💋</option>
                          <option value="🔥">🔥</option>
                          <option value="❤️">❤️</option>
                          <option value="😘">😘</option>
                          <option value="👅">👅</option>
                          <option value="🍑">🍑</option>
                          <option value="💦">💦</option>
                          <option value="🥵">🥵</option>
                          <option value="🎁">🎁</option>
                          <option value="💎">💎</option>
                        </select>

                      </div>
                    </div>

                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Token Amount"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                    />

                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Emoji"
                      value={emoji}
                      onChange={(e) =>
                        setEmoji(e.target.value)
                      }
                    />

                    <button
                      className="btn btn-danger w-100"
                      onClick={handleSubmit}
                    >
                      ➕ Add Tip
                    </button>

                  </div>
                </div>
              </div>

              {/* LIST */}
              <div className="col-md-7">
                <div className="card border-0 rounded-4 shadow-lg">
                  <div className="card-body">

                    <h5 className="fw-bold mb-3">
                      Tip List
                    </h5>

                    {tips
                      ?.filter((item) => item.tiptype === "Tip")
                      ?.map((item) => (
                        <div
                          key={item._id}
                          className="d-flex justify-content-between align-items-center border-bottom py-3"
                        >
                          <div>
                            <h6 className="mb-0">
                              💎 {item.title}
                            </h6>
                            <small className="text-muted">
                              {item.amount} Tokens
                            </small>
                          </div>

                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-warning">
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TOYS FORM ================= */}
          {activeTab === "toys" && (
            <div className="row">

              {/* FORM */}
              <div className="col-md-5">
                <div className="card border-0 rounded-4 shadow-lg">
                  <div className="card-body">

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Toy Name
                      </label>

                      <div className="input-group">

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Toy Name"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />

                        <select
                          className="form-select"
                          style={{ maxWidth: "120px" }}
                          value={emoji}
                          onChange={(e) => setEmoji(e.target.value)}
                        >
                          <option value="">Icon</option>
                          <option value="🔥">🔥</option>
                          <option value="💓">💓</option>
                          <option value="⚡">⚡</option>
                          <option value="💦">💦</option>
                          <option value="🍑">🍑</option>
                          <option value="🎮">🎮</option>
                          <option value="🔊">🔊</option>
                        </select>

                      </div>
                    </div>

                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Token Price"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                    />

                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Animation / Emoji"
                      value={emoji}
                      onChange={(e) =>
                        setEmoji(e.target.value)
                      }
                    />

                    <button
                      className="btn btn-dark w-100"
                      onClick={handleSubmit}
                    >
                      ➕ Add Toy
                    </button>

                  </div>
                </div>
              </div>

              {/* LIST */}
              <div className="col-md-7">
                <div className="card border-0 rounded-4 shadow-lg">
                  <div className="card-body">

                    <h5 className="fw-bold mb-3">
                      Sexy Toys List
                    </h5>

                    {tips
                      ?.filter((item) => item.tiptype === "Toy")
                      ?.map((item) => (
                        <div
                          key={item._id}
                          className="d-flex justify-content-between align-items-center border-bottom py-3"
                        >
                          <div>
                            <h6 className="mb-0">
                              🔥 {item.title}
                            </h6>
                            <small className="text-muted">
                              {item.amount} Tokens
                            </small>
                          </div>

                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-warning">
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}