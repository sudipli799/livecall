import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function CreatorSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menu = [
    { icon: "🏠", label: "Dashboard", path: "/creator/dashboard" },
    { icon: "🔴", label: "Go Live", path: "/creator/go-live" },
    { icon: "🎁", label: "Tip Menu", path: "/creator/tip-menu" },
    { icon: "🔒", label: "Private Shows", path: "/creator/private" },
    { icon: "🔒", label: "Private Request", path: "/creator/private-request" },
    { icon: "💰", label: "Earnings", path: "/creator/earning" },
    { icon: "👥", label: "Withdrawal", path: "/creator/withdrawal" },
  ];

  // ✅ ROLE CHECK
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "creator") {
      // 🔥 redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "agent") {
        navigate("/agent/dashboard");
      } else {
        navigate("/"); // normal user
      }
    }
  }, []);

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* 📱 MOBILE TOP BAR */}
      <div className="d-md-none p-2 bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">✨ Creator Panel</h5>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* 📱 OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 998,
          }}
        />
      )}

      {/* 📱 MOBILE SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-100%",
          height: "100%",
          width: 260,
          zIndex: 999,
          transition: "0.3s",
        }}
        className="text-white p-4 d-md-block"
      >
        <div
          style={{
            background: "linear-gradient(180deg,#020617,#0f172a)",
            height: "100%",
            padding: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">✨ Creator</h4>

            <button
              className="btn btn-sm btn-light d-md-none"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* MENU */}
          <ul className="nav flex-column gap-2 flex-grow-1">
            {menu.map((item, i) => (
              <li key={i}>
                <NavLink
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `nav-link rounded-3 px-3 py-2 fw-semibold ${
                      isActive
                        ? "bg-danger shadow-lg text-white"
                        : "text-white opacity-75"
                    }`
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* 🔥 FIXED LOGOUT */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="btn btn-danger w-100 rounded-pill fw-semibold"
            >
              ⚙️ Logout
            </button>
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP SIDEBAR */}
      <div className="d-none d-md-block col-md-3 col-lg-2">
        <div
          className="text-white p-4 d-flex flex-column"
          style={{
            background: "linear-gradient(180deg,#020617,#0f172a)",
            height: "100vh",
          }}
        >
          <h4 className="fw-bold text-center mb-4">
            ✨ Creator Panel
          </h4>

          <ul className="nav flex-column gap-2 flex-grow-1">
            {menu.map((item, i) => (
              <li key={i}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link rounded-3 px-3 py-2 fw-semibold ${
                      isActive
                        ? "bg-danger shadow-lg text-white"
                        : "text-white opacity-75"
                    }`
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* 🔥 FIXED LOGOUT */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="btn btn-danger w-100 rounded-pill fw-semibold"
            >
              ⚙️ Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}