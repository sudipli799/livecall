import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { agentregister } from "../../redux/slices/authSlice";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminAddAgent() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.auth);

  const [apiError, setApiError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "agent", // ✅ agent create hoga
    vendor_id: user?.username || localStorage.getItem("userId"), // ✅ admin id
    gender: "",
    country: "",
  });

  // IMAGE UPLOAD
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setShowCropModal(true);
    }
  };

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const getCroppedImg = async (imageSrc, crop) => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob((blob) => {
          if (!blob) return;
          resolve(new File([blob], "profile.jpg", { type: "image/jpeg" }));
        });
      };
    });
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;

    const cropped = await getCroppedImg(previewImage, croppedAreaPixels);
    setProfileImage(cropped);
    setPreviewImage(URL.createObjectURL(cropped));
    setShowCropModal(false);
  };

  // INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") validatePassword(value);
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;

    if (!regex.test(password)) {
      setPasswordError("Weak password");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&#^()_-+=";

    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }

    setFormData((prev) => ({ ...prev, password: pass }));
    validatePassword(pass);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) return;

    try {
      setApiError("");

      const data = new FormData();

      Object.keys(formData).forEach((k) => {
        data.append(k, formData[k]);
      });

      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      await dispatch(agentregister(data)).unwrap();

      alert("Agent Created ✅");

      setTimeout(() => {
        navigate("/admin/agent");
      }, 1000);

    } catch (err) {
      console.log("FULL ERROR:", err);

      setApiError(
        err?.message ||
        err?.response?.data?.message ||
        err ||
        "Something went wrong"
      );
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <AdminSidebar />

        <div className="col-12 col-md-9 col-lg-10 p-4"
          style={{ background: "linear-gradient(135deg,#eef2ff,#f8fafc)" }}>

          <h2 className="fw-bold mb-4">➕ Add Agent</h2>

          <div className="card p-4 border-0 rounded-4 shadow">

            {apiError && (
              <div className="alert alert-danger text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3">

              {/* ✅ Hidden Fields */}
              <input type="hidden" name="role" value="agent" />
              <input type="hidden" name="vendor_id" value={formData.vendor_id} />

              <div className="col-md-6">
                <input name="name" placeholder="Full Name" className="form-control" onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <input name="username" placeholder="Username" className="form-control" onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <input type="email" name="email" placeholder="Email" className="form-control" onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <select name="gender" className="form-control" onChange={handleChange} required>
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="col-md-6">
                <select name="country" className="form-control" onChange={handleChange} required>
                  <option value="">Country</option>
                  <option>India</option>
                  <option>USA</option>
                </select>
              </div>

              <div className="col-md-6">
                <input type="file" className="form-control" onChange={handleImageChange} />
                {previewImage && <img src={previewImage} alt="" width={120} className="mt-2 rounded" />}
              </div>

              <div className="col-12 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <span onClick={generatePassword}
                  style={{ position: "absolute", right: 60, top: 10, cursor: "pointer", color: "green" }}>
                  Generate
                </span>

                <span onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 15, top: 10, cursor: "pointer" }}>
                  👁
                </span>
              </div>

              {passwordError && <small className="text-danger">{passwordError}</small>}

              <div className="col-12">
                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? "Creating..." : "Create Agent"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* CROP MODAL */}
      {showCropModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{
            width: 350,
            background: "#fff",
            padding: 20,
            borderRadius: 16,
            textAlign: "center"
          }}>
            <div style={{
              position: "relative",
              width: "100%",
              height: 250,
              background: "#000",
              borderRadius: 10,
              overflow: "hidden"
            }}>
              <Cropper
                image={previewImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="form-range mt-3"
            />

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-secondary w-50" onClick={() => setShowCropModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success w-50" onClick={handleCropSave}>
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}