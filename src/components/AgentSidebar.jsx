import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { handleLogout } from "../redux/slices/Logout"; 

export default function AgentSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  

  const menu = [
    { icon: "📊", label: "Dashboard", path: "/agent/dashboard" },
    { icon: "👥", label: "My Users", path: "/agent/users" },
    { icon: "➕", label: "Add User", path: "/agent/add-user" },
    { icon: "🔴", label: "Live", path: "/agent/live" },
    // { icon: "📄", label: "User Reports", path: "/agent/reports" },
    // { icon: "⚙️", label: "Settings", path: "/agent/settings" },
  ];

  // ✅ ROLE CHECK
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "agent") {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "creator") {
        navigate("/creator/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* 📱 MOBILE TOP BAR */}
      <div className="d-md-none p-2 bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">👨‍💼 Agent Panel</h5>

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
        className="text-white p-4 d-md-none"
      >
        <div
          className="d-flex flex-column justify-content-between"
          style={{
            background: "linear-gradient(180deg,#020617,#0f172a)",
            height: "100%",
            padding: 20,
            boxShadow: "6px 0 25px rgba(0,0,0,.6)",
          }}
        >
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">👨‍💼 Agent</h4>

              <button
                className="btn btn-sm btn-light"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <ul className="nav flex-column gap-2">
              {menu.map((item, i) => (
                <li key={i}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `nav-link rounded-3 px-3 py-2 fw-semibold ${
                        isActive
                          ? "bg-success shadow-lg text-white"
                          : "text-white opacity-75"
                      }`
                    }
                  >
                    {item.icon} {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* LOGOUT */}
          <div
            className="p-3 rounded-4"
            style={{
              background: "linear-gradient(135deg,#22c55e,#14532d)",
            }}
          >
            <div className="small opacity-75">Agent Access</div>
            <h6 className="fw-bold mb-2">User Management</h6>
            <button
              onClick={handleLogout}
              className="btn btn-light btn-sm w-100 fw-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP SIDEBAR */}
      <div className="d-none d-md-block col-md-3 col-lg-2">
        <div
          className="text-white p-4 d-flex flex-column justify-content-between"
          style={{
            background: "linear-gradient(180deg,#020617,#0f172a)",
            height: "100vh",
            position: "fixed",
            width: "inherit",
            boxShadow: "6px 0 25px rgba(0,0,0,.6)",
          }}
        >
          <div>
            <h4 className="fw-bold text-center mb-4">
              👨‍💼 Agent Panel
            </h4>

            <ul className="nav flex-column gap-2">
              {menu.map((item, i) => (
                <li key={i}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link rounded-3 px-3 py-2 fw-semibold ${
                        isActive
                          ? "bg-success shadow-lg text-white"
                          : "text-white opacity-75"
                      }`
                    }
                  >
                    {item.icon} {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* LOGOUT */}
          <div
            className="p-3 rounded-4"
            style={{
              background: "linear-gradient(135deg,#22c55e,#14532d)",
            }}
          >
            <div className="small opacity-75">Agent Access</div>
            <h6 className="fw-bold mb-2">User Management</h6>
            <button
              onClick={handleLogout}
              className="btn btn-light btn-sm w-100 fw-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}