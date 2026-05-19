import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";
// import AgentSidebar from "../components/AgentSidebar";

export default function AgentSettings() {

  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const [bankList, setBankList] = useState([]);

  const [formData, setFormData] = useState({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
  });


  // ================= STATUS CHANGE =================
const handleStatusChange = async (
  id,
  status
) => {

  try {

    const res = await axiosInstance.put(
      `${ENDPOINTS.UPDATEBANKSTATUS}/${id}`,
      {
        status,
        user_id: user?._id
      }
    );

    if (res?.data?.success) {

      alert(
        `Bank account ${
          status === 1
            ? "activated"
            : "deactivated"
        } successfully`
      );

      fetchBanks();

    }

  } catch (error) {

    console.log(error);

    alert(
      error?.response?.data?.message ||
      "Something went wrong"
    );

  }
};

  // ================= FETCH BANKS =================
  const fetchBanks = async () => {

    try {

      setLoading(true);

      const res = await axiosInstance.get(
        `${ENDPOINTS.BANKLIST}/${user?._id}`
      );

      if (res?.data?.success) {
        setBankList(res.data.data || []);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    if (user?._id) {
      fetchBanks();
    }

  }, [user]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  // ================= SAVE BANK =================
  const handleSave = async () => {

    try {

      if (
        !formData.account_holder_name ||
        !formData.bank_name ||
        !formData.account_number ||
        !formData.ifsc_code
      ) {
        alert("Please fill all required fields");
        return;
      }

      setLoading(true);

      const payload = {
        user_id: user?._id,
        ...formData
      };

      const res = await axiosInstance.post(
        ENDPOINTS.ADDBANKACCOUNT,
        payload
      );

      if (res?.data?.success) {

        alert("Bank account added successfully ✅");

        setFormData({
          account_holder_name: "",
          bank_name: "",
          account_number: "",
          ifsc_code: "",
          upi_id: "",
        });

        fetchBanks();

      }

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  // ================= DELETE BANK =================
  const handleDelete = async (id) => {

    try {

      const confirmDelete = window.confirm(
        "Are you sure want to delete?"
      );

      if (!confirmDelete) return;

      const res = await axiosInstance.delete(
        `${ENDPOINTS.DELETEBANKACCOUNT}/${id}`
      );

      if (res?.data?.success) {

        alert("Deleted successfully");

        fetchBanks();

      }

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="container-fluid">

      <div className="row min-vh-100">

        <CreatorSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background:
              "linear-gradient(135deg,#eef2ff,#f8fafc)"
          }}
        >

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">

            <h2 className="fw-bold">
              ⚙️ Bank Settings
            </h2>

          </div>

          {/* ================= ADD FORM ================= */}
          <div
            className="card border-0 rounded-4 p-4 mb-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
              boxShadow:
                "0 10px 30px rgba(0,0,0,.08)"
            }}
          >

            <h5 className="fw-semibold mb-4">
              🏦 Add Bank Account
            </h5>

            <div className="row g-3">

              {/* ACCOUNT HOLDER */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Account Holder Name
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Enter account holder name"
                  name="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                />

              </div>

              {/* BANK NAME */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Bank Name
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Enter bank name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                />

              </div>

              {/* ACCOUNT NUMBER */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Account Number
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Enter account number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                />

              </div>

              {/* IFSC */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  IFSC Code
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Enter IFSC code"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                />

              </div>

              {/* UPI */}
              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  UPI ID (Optional)
                </label>

                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="example@upi"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* BUTTON */}
            <div className="mt-4">

              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={handleSave}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Account"}
              </button>

            </div>

          </div>

          {/* ================= BANK LIST ================= */}
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden">

            <div
              style={{
                height: 5,
                background:
                  "linear-gradient(90deg,#6366f1,#ec4899,#22c55e)"
              }}
            />

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                💳 Saved Accounts
              </h5>

              {loading ? (

                <div className="text-center py-5">
                  Loading...
                </div>

              ) : bankList.length === 0 ? (

                <div className="text-center py-5 text-muted">
                  No bank account added yet
                </div>

              ) : (

                <div className="row g-4">

                  {bankList.map((item) => (

                    <div
                      className="col-md-6 col-lg-4"
                      key={item._id}
                    >

                      <div
                        className="p-4 rounded-4 h-100"
                        style={{
                          background:
                            "linear-gradient(135deg,#0f172a,#1e293b)",
                          color: "#fff",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >

                        {/* TOP */}
                        <div className="d-flex justify-content-between mb-4">

                          <div>

                            <div
                              style={{
                                fontSize: 13,
                                opacity: 0.7
                              }}
                            >
                              BANK
                            </div>

                            <div
                              className="fw-bold"
                              style={{
                                fontSize: 18
                              }}
                            >
                              {item.bank_name}
                            </div>

                          </div>

                          <div
                            style={{
                              fontSize: 28
                            }}
                          >
                            💳
                          </div>

                        </div>

                        {/* DETAILS */}
                        <div className="mb-2">

                          <small
                            style={{
                              opacity: 0.7
                            }}
                          >
                            Account Holder
                          </small>

                          <div className="fw-semibold">
                            {item.account_holder_name}
                          </div>

                        </div>

                        <div className="mb-2">

                          <small
                            style={{
                              opacity: 0.7
                            }}
                          >
                            Account Number
                          </small>

                          <div className="fw-semibold">
                            ****
                            {item.account_number?.slice(-4)}
                          </div>

                        </div>

                        <div className="mb-2">

                          <small
                            style={{
                              opacity: 0.7
                            }}
                          >
                            IFSC
                          </small>

                          <div className="fw-semibold">
                            {item.ifsc_code}
                          </div>

                        </div>

                        {item.upi_id && (

                          <div className="mb-2">

                            <small
                              style={{
                                opacity: 0.7
                              }}
                            >
                              UPI ID
                            </small>

                            <div className="fw-semibold">
                              {item.upi_id}
                            </div>

                          </div>

                        )}

                        {/* BUTTON */}
                        {/* BUTTONS */}
                          <div className="mt-4 d-flex gap-2 flex-wrap">

                            {/* ACTIVE / DEACTIVE BUTTON */}
                            {bankList.length > 1 && (

                              <button
                                className={`btn btn-sm rounded-pill px-3 ${
                                  item.status === 1
                                    ? "btn-success"
                                    : "btn-secondary"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    item._id,
                                    item.status === 1 ? 0 : 1
                                  )
                                }
                              >
                                {item.status === 1
                                  ? "Deactive"
                                  : "Active"}
                              </button>

                            )}

                            

                          </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}