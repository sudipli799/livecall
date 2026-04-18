import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const menu = [
    { icon: "📊", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "👤", label: "Users", path: "/admin/user" },
    { icon: "🎥", label: "Creators", path: "/admin/creator" },
    { icon: "🔴", label: "Live", path: "/admin/live" },
    {
      icon: "🎥",
      label: "Agents",
      submenu: [
        { label: "Add New Agent", path: "/admin/add-agent" },
        { label: "Agent List", path: "/admin/agent" },
      ],
    },
    {
      icon: "💰",
      label: "Transactions",
      submenu: [
        { label: "Wallet Recharge", path: "/admin/transactions/recharge" },
        { label: "Tip", path: "/admin/transactions/tip" },
      ],
    },
    { icon: "🏦", label: "Withdraw", path: "/admin/withdraw" },
    { icon: "⚙️", label: "Settings", path: "/admin/setting" },
  ];

  // ✅ ROLE CHECK
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      if (user.role === "agent") {
        navigate("/agent/dashboard");
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
        <h5 className="mb-0">🛠 Admin Panel</h5>

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
          style={{
            background: "linear-gradient(180deg,#020617,#0f172a)",
            height: "100%",
            padding: 20,
            boxShadow: "6px 0 25px rgba(0,0,0,.6)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">🛠 Admin</h4>

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
                {!item.submenu && (
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
                )}

                {item.submenu && (
                  <>
                    <div
                      onClick={() =>
                        setOpenMenu(openMenu === i ? null : i)
                      }
                      className="nav-link rounded-3 px-3 py-2 fw-semibold text-white opacity-75"
                      style={{ cursor: "pointer" }}
                    >
                      {item.icon} {item.label}
                      <span style={{ float: "right" }}>
                        {openMenu === i ? "▲" : "▼"}
                      </span>
                    </div>

                    {openMenu === i && (
                      <ul className="list-unstyled ps-3 mt-1">
                        {item.submenu.map((sub, j) => (
                          <li key={j}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                `nav-link py-1 small ${
                                  isActive
                                    ? "text-warning fw-bold"
                                    : "text-white opacity-75"
                                }`
                              }
                            >
                              ➤ {sub.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* LOGOUT */}
          <div
            className="mt-4 p-3 rounded-4"
            style={{
              background: "linear-gradient(135deg,#3b82f6,#1e3a8a)",
            }}
          >
            <div className="small opacity-75">Admin Access</div>
            <h6 className="fw-bold mb-1">Full Control</h6>
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
          className="text-white p-4 d-flex flex-column"
          style={{
            background: "linear-gradient(180deg,#020617,#0f172a)",
            height: "100vh",
            position: "fixed",
            width: "inherit",
            boxShadow: "6px 0 25px rgba(0,0,0,.6)",
          }}
        >
          <h4 className="fw-bold text-center mb-4">
            🛠 Admin Panel
          </h4>

          <ul className="nav flex-column gap-2">
            {menu.map((item, i) => (
              <li key={i}>
                {!item.submenu && (
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
                )}

                {item.submenu && (
                  <>
                    <div
                      onClick={() =>
                        setOpenMenu(openMenu === i ? null : i)
                      }
                      className="nav-link rounded-3 px-3 py-2 fw-semibold text-white opacity-75"
                      style={{ cursor: "pointer" }}
                    >
                      {item.icon} {item.label}
                      <span style={{ float: "right" }}>
                        {openMenu === i ? "▲" : "▼"}
                      </span>
                    </div>

                    {openMenu === i && (
                      <ul className="list-unstyled ps-3 mt-1">
                        {item.submenu.map((sub, j) => (
                          <li key={j}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                `nav-link py-1 small ${
                                  isActive
                                    ? "text-warning fw-bold"
                                    : "text-white opacity-75"
                                }`
                              }
                            >
                              ➤ {sub.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* FIXED LOGOUT */}
          <div
            className="mt-auto p-3 rounded-4"
            style={{
              background: "linear-gradient(135deg,#3b82f6,#1e3a8a)",
            }}
          >
            <div className="small opacity-75">Admin Access</div>
            <h6 className="fw-bold mb-1">Full Control</h6>
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