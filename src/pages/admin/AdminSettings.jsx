import React, { useState, useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminSidebar from "../../components/AdminSidebar";

import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";


export default function AdminSettings() {

  // EXISTING STATE
  const [commission, setCommission] = useState(20);
  const [minWithdraw, setMinWithdraw] = useState(1000);
  const [maxDaily, setMaxDaily] = useState(5000);
  const [maintenance, setMaintenance] = useState(false);

  // NEW STATES
  const [ownerName, setOwnerName] = useState("Admin Owner");
  const [companyName, setCompanyName] = useState("My Company");
  const [email, setEmail] = useState("support@company.com");
  const [phone, setPhone] = useState("9999999999");
  const [domain, setDomain] = useState("https://myapp.com");

  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [settlementPolicy, setSettlementPolicy] = useState("");

  const [aboutUs, setAboutUs] = useState("");

  const [userTerms, setUserTerms] = useState("");
  const [creatorTerms, setCreatorTerms] = useState("");

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");

  const handleSave = async () => {
  try {
    const payload = {
      commission,
      minWithdraw,
      maxDaily,
      maintenance,

      ownerName,
      companyName,
      email,
      phone,
      domain,

      privacyPolicy,
      refundPolicy,
      settlementPolicy,

      aboutUs,

      userTerms,
      creatorTerms,

      instagram,
      facebook,
      twitter,
    };

    const res = await axiosInstance.post(
      ENDPOINTS.SAVESETTING, // make sure this exists
      payload
    );

    if (res.data.success) {
      alert(res.data.message || "Settings saved successfully");
    } else {
      alert("Failed to save settings");
    }

  } catch (error) {
    console.log(error);
    alert("Server Error");
  }
};


const fetchSetting = async () => {
  try {
    const res = await axiosInstance.get(ENDPOINTS.GETSETTING);

    if (res?.data?.data) {
      const data = res.data.data;

      // ✅ set all fields
      setCommission(data.commission || 0);
      setMinWithdraw(data.minWithdraw || 0);
      setMaxDaily(data.maxDaily || 0);
      setMaintenance(data.maintenance || false);

      setOwnerName(data.ownerName || "");
      setCompanyName(data.companyName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setDomain(data.domain || "");

      setPrivacyPolicy(data.privacyPolicy || "");
      setRefundPolicy(data.refundPolicy || "");
      setSettlementPolicy(data.settlementPolicy || "");

      setAboutUs(data.aboutUs || "");

      setUserTerms(data.userTerms || "");
      setCreatorTerms(data.creatorTerms || "");

      setInstagram(data.instagram || "");
      setFacebook(data.facebook || "");
      setTwitter(data.twitter || "");
    }

  } catch (error) {
    console.log("Error fetching settings", error);
  }
};

useEffect(() => {
  fetchSetting();
}, []);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <AdminSidebar />

        <div
          className="col-12 col-md-9 col-lg-10 p-4"
          style={{
            background: "radial-gradient(circle at top,#f9fafb,#e5e7eb)",
          }}
        >

          {/* HEADER */}
          <div className="mb-4">
            <h2 className="fw-bold">⚙️ Admin Settings</h2>
            <small className="text-muted">
              Control your platform settings
            </small>
          </div>

          {/* ================= BASIC SETTINGS ================= */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">🔧 Platform Controls</h5>

              <div className="row g-3">

                <div className="col-md-3">
                  <label>💰 Commission (%)</label>
                  <input className="form-control"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)} />
                </div>

                <div className="col-md-3">
                  <label>💸 Min Withdraw (₹)</label>
                  <input className="form-control"
                    value={minWithdraw}
                    onChange={(e) => setMinWithdraw(e.target.value)} />
                </div>

                <div className="col-md-3">
                  <label>📊 Max Daily Tokens</label>
                  <input className="form-control"
                    value={maxDaily}
                    onChange={(e) => setMaxDaily(e.target.value)} />
                </div>

                <div className="col-md-3 d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={maintenance}
                    onChange={() => setMaintenance(!maintenance)}
                  />
                  <label>🚧 Maintenance Mode</label>
                </div>

              </div>
            </div>
          </div>

          {/* ================= OWNER + COMPANY ================= */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">🏢 Company Information</h5>

              <div className="row g-3">

                <div className="col-md-4">
                  <label>👤 Owner Name</label>
                  <input className="form-control"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label>🏢 Company Name</label>
                  <input className="form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label>📧 Email</label>
                  <input className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label>📞 Phone</label>
                  <input className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="col-md-8">
                  <label>🌐 Domain</label>
                  <input className="form-control"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)} />
                </div>

              </div>
            </div>
          </div>

          {/* ================= POLICIES ================= */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">📜 Policies</h5>

              <textarea className="form-control mb-3"
                rows={3}
                placeholder="Privacy Policy"
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)} />

              <textarea className="form-control mb-3"
                rows={3}
                placeholder="Refund Policy"
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)} />

              <textarea className="form-control"
                rows={3}
                placeholder="Settlement Policy"
                value={settlementPolicy}
                onChange={(e) => setSettlementPolicy(e.target.value)} />

            </div>
          </div>

          {/* ================= ABOUT ================= */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">ℹ️ About Us</h5>

              <textarea className="form-control"
                rows={4}
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)} />

            </div>
          </div>

          {/* ================= TERMS ================= */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">📄 Terms & Conditions</h5>

              <textarea className="form-control mb-3"
                rows={3}
                placeholder="User Terms"
                value={userTerms}
                onChange={(e) => setUserTerms(e.target.value)} />

              <textarea className="form-control"
                rows={3}
                placeholder="Creator Terms"
                value={creatorTerms}
                onChange={(e) => setCreatorTerms(e.target.value)} />

            </div>
          </div>

          {/* ================= SOCIAL LINKS ================= */}
          <div className="card border-0 rounded-4 shadow-lg mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">🌐 Social Media Links</h5>

              <div className="row g-3">

                <div className="col-md-4">
                  <input className="form-control"
                    placeholder="📸 Instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <input className="form-control"
                    placeholder="📘 Facebook"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <input className="form-control"
                    placeholder="🐦 Twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)} />
                </div>

              </div>

            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="text-end">
            <button className="btn btn-danger px-5 py-2 fw-bold" onClick={handleSave}>
              💾 Save All Settings
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}