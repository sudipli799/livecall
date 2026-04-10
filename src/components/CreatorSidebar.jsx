import React from "react";
import { NavLink } from "react-router-dom";

export default function CreatorSidebar() {
  const menu = [
    { icon: "🏠", label: "Dashboard", path: "/creator/dashboard" },
    { icon: "🔴", label: "Go Live", path: "/creator/go-live" },
    { icon: "🎁", label: "Tip Menu", path: "/creator/tip-menu" },
    { icon: "🔒", label: "Private Shows", path: "/creator/private" },
    { icon: "💰", label: "Earnings", path: "/creator/earning" },
    { icon: "👥", label: "Fans", path: "/creator/fans" },
    { icon: "📁", label: "Content", path: "/creator/content" },
    { icon: "⚙️", label: "Settings", path: "/creator/settings" },
  ];

  return (
    <div
      className="col-12 col-md-3 col-lg-2 text-white p-4"
      style={{
        background: "linear-gradient(180deg,#020617,#0f172a)",
        boxShadow: "6px 0 25px rgba(0,0,0,.6)",
      }}
    >
      <h4 className="fw-bold text-center mb-4">
        ✨ Creator Panel
      </h4>

      {/* MENU */}
      <ul className="nav flex-column gap-2">
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
              style={{ cursor: "pointer" }}
            >
              {item.icon} {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* WALLET */}
      <div
        className="mt-4 p-3 rounded-4"
        style={{
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          boxShadow: "0 10px 30px rgba(0,0,0,.4)",
        }}
      >
        <div className="small opacity-75">Wallet Balance</div>
        <h4 className="fw-bold mb-1">₹12,480</h4>
        <div className="small mb-2">💎 2,340 Tokens</div>
        <button className="btn btn-dark btn-sm w-100 fw-semibold">
          Withdraw
        </button>
      </div>
    </div>
  );
}
