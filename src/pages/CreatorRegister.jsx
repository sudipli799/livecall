import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

const CreatorRegister = () => {

  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setShowCropModal(true); // 👉 crop open
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
          1,
          crop.width,
          crop.height
        );

        canvas.toBlob((blob) => {
          const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg");
      };
    });
  };

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(previewImage, croppedAreaPixels);

    setProfileImage(croppedImage);
    setPreviewImage(URL.createObjectURL(croppedImage));
    setShowCropModal(false);
  };

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "creator",
    gender: "",
    country: "",
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Clean handleChange (no placeholder dependency)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      validatePassword(value);
    }
  };

  // ✅ Strong Password Validation
  const validatePassword = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

    if (!strongRegex.test(password)) {
      setPasswordError(
        "Password must be 8+ chars, include Uppercase, Lowercase, Number & Special Character."
      );
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // ✅ Secure Generator (Guaranteed Strong)
  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@$!%*?&#^()_-+=";

    const getRandom = (str) =>
      str[Math.floor(Math.random() * str.length)];

    let password =
      getRandom(upper) +
      getRandom(lower) +
      getRandom(numbers) +
      getRandom(special);

    const allChars = upper + lower + numbers + special;

    for (let i = 0; i < 8; i++) {
      password += getRandom(allChars);
    }

    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setFormData((prev) => ({
      ...prev,
      password,
    }));

    validatePassword(password);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validatePassword(formData.password)) return;

  try {
    const data = new FormData();

    // text fields
    data.append("name", formData.name);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);
    data.append("gender", formData.gender);
    data.append("country", formData.country);

    // 👇 IMPORTANT: image file
    if (profileImage) {
      data.append("profileImage", profileImage);
    }

    await dispatch(registerUser(data)).unwrap();

    setTimeout(() => {
      navigate("/creator/dashboard", { replace: true });
    }, 100);

  } catch (err) {
    console.log(err);
  }
};


  return (
    <>
      <div style={styles.page}>
        <div
          style={{
            ...styles.overlay,
            flexDirection: isMobile ? "column" : "row",
            padding: isMobile ? "30px 20px" : "0 80px",
          }}
        >
          {/* LEFT */}
          <div
            style={{
              ...styles.left,
              textAlign: isMobile ? "center" : "left",
              marginBottom: isMobile ? "30px" : "0",
              paddingLeft: isMobile ? "0" : "60px",
            }}
          >
            <h1
              style={{
                ...styles.heading,
                fontSize: isMobile ? "32px" : "42px",
              }}
            >
              One account, <br /> Multiple benefits 🚀
            </h1>

            <p style={styles.subHeading}>Monetize your content</p>

            {!isMobile && (
              <ul style={styles.points}>
                <li>✔ Get paid for video views</li>
                <li>✔ Promote your link</li>
                <li>✔ Win a share of the $33k prize</li>
              </ul>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ ...styles.card, width: isMobile ? "100%" : "420px" }}>
            <div style={styles.tabs}>
              <button
                style={{ ...styles.tab }}
                onClick={() => navigate("/register")}
              >
                User Account
              </button>

              <button style={{ ...styles.tab, ...styles.activeTab }}>
                Creator Account
              </button>
            </div>

            <form style={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                style={styles.input}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="username"
                placeholder="UserName"
                style={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                style={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="gay">Gay</option>
                <option value="others">Others</option>
              </select>

              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>

              <div style={styles.imageUploadCard}>
                <label style={styles.imageLabel}>📸 Profile Image</label>

                <label style={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />

                  <div style={styles.uploadInner}>
                    <div style={styles.uploadIcon}>⬆️</div>
                    <div style={styles.uploadText}>Click to upload image</div>
                    <div style={styles.uploadSubText}>PNG, JPG up to 5MB</div>
                  </div>
                </label>

                {previewImage && (
                  <div style={styles.previewWrapper}>
                    <img
                      src={previewImage}
                      alt="preview"
                      style={styles.previewImage}
                    />
                  </div>
                )}
              </div>


              {/* PASSWORD FIELD */}
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  style={styles.passwordInput}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <span
                  onClick={generatePassword}
                  style={styles.generateInside}
                >
                  Generate
                </span>

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>

              {passwordError && (
                <p style={{ color: "red", fontSize: "13px" }}>
                  {passwordError}
                </p>
              )}

              {error && (
                <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
              )}

              <button style={styles.button} disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p style={styles.footerText}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>

          {showCropModal && (
            <div style={styles.cropModal}>
              <div style={styles.cropContainer}>
                <Cropper
                  image={previewImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={4/3} // square (profile pic)
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div style={styles.cropControls}>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                />

                <button onClick={handleCropSave}>Save</button>
                <button onClick={() => setShowCropModal(false)}>Cancel</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

/* ================= STYLES (UNCHANGED) ================= */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "url('https://static.xhpingcdn.com/xh-desktop/images/signup-creator/creator-sign-up-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  overlay: {
    minHeight: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { color: "#fff", maxWidth: "520px" },
  heading: { fontWeight: "800", marginBottom: "10px" },
  subHeading: { fontSize: "18px", opacity: 0.9 },
  points: { marginTop: "25px", lineHeight: "1.8" },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 20px 40px rgba(0,0,0,.4)",
  },
  tabs: { display: "flex", marginBottom: "20px" },
  tab: {
    flex: 1,
    padding: "12px",
    border: "none",
    cursor: "pointer",
  },
  activeTab: { background: "#007bff", color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc" },
  button: {
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "12px 110px 12px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  generateInside: {
    position: "absolute",
    right: "45px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    color: "#28a745",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    cursor: "pointer",
    fontSize: "18px",
  },
  footerText: { marginTop: "15px", textAlign: "center" },

  cropModal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  cropContainer: {
    position: "relative",
    width: "300px",
    height: "300px",
    background: "#000",
  },

  cropControls: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  previewImage:{
    width: '30%',
    marginTop:'20px'
  },

  imageUploadCard: {
    padding: "18px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #e6e6e6",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    maxWidth: "420px",
  },

  imageLabel: {
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "10px",
    display: "block",
    color: "#222",
  },

  uploadArea: {
    display: "block",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.3s",
    background: "#f8fafc",
  },

  uploadInner: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
  },

  uploadIcon: {
    fontSize: "22px",
  },

  uploadText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },

  uploadSubText: {
    fontSize: "12px",
    color: "#64748b",
  },

  fileInput: {
    display: "none",
  },

  previewWrapper: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "center",
  },

  previewImage: {
    width: "150px",
    borderRadius: "10%",
    objectFit: "cover",
    border: "3px solid #3b82f6",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

};

export default CreatorRegister;
