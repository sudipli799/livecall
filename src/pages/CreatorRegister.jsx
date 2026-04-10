import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";

const CreatorRegister = () => {

  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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
    await dispatch(registerUser(formData)).unwrap();

    // small delay ensures redux state updated
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
};

export default CreatorRegister;
