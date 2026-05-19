import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { Collapse } from "bootstrap";


function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    closeMobileMenu(); // ✅ close menu
    navigate("/login");
  };

  // ✅ CLOSE MOBILE MENU FUNCTION
  const closeMobileMenu = () => {
    const menu = document.getElementById("mobileMenu");
    if (menu) {
      const bsCollapse = Collapse.getInstance(menu);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <nav className="navbar navbar-light bg-white border-bottom px-3">
        <div className="d-flex align-items-center gap-3">

          {/* MENU ICON */}
          <button
            className="btn d-md-none"
            data-bs-toggle="collapse"
            data-bs-target="#mobileMenu"
          >
            <FaBars size={20} />
          </button>

          <span className="fw-bold text-danger fs-4">
            xMASTER Live
          </span>
        </div>

        {/* SEARCH */}
        <form className="d-none d-md-flex flex-grow-1 mx-4">
          <div className="input-group">
            <input
              className="form-control rounded-pill"
              placeholder="xMaster live cam indian"
            />
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>
          </div>
        </form>

        {/* RIGHT */}
        <div className="d-flex align-items-center gap-3">

          <span className="small fw-semibold d-none d-md-inline">
            EN
          </span>

          {!user || !token ? (
            <>
              <Link
                to="/login"
                className="text-decoration-none text-dark d-none d-md-inline"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-danger rounded-pill px-3"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">

              {user?.membershipStatus === 1 &&
                user?.membershipEndDate &&
                new Date(user.membershipEndDate) > new Date() ? (

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* 🔥 DAYS LEFT */}
                    <div
                      style={{
                        background: "#111",
                        color: "#fff",
                        padding: "8px 14px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      ⏳{" "}
                      {Math.ceil(
                        (new Date(user.membershipEndDate) -
                          new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      Days Left
                    </div>

                    
                    {/* 🔥 MONTHLY => SHOW UPGRADE */}
                    {user?.membershipType === "monthly" && (
                      <Link
                        to="/ultimate"
                        className="btn btn-warning rounded-pill fw-bold px-3"
                        style={{
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⬆ Upgrade Plan
                      </Link>
                    )}
                  </div>

                ) : (

                  <Link
                    to="/ultimate"
                    className="btn btn-warning rounded-pill fw-bold px-3"
                    style={{
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🚀 GO ULTIMATE
                  </Link>

                )}

              <Link
                  to="/creator/dashboard"
                  className="fw-bold text-dark text-decoration-none d-flex align-items-center gap-1"
                >
                  {user?.name}

                  {/* 👑 MEMBERSHIP CROWN */}
                  {user?.membershipStatus === 1 &&
                    user?.membershipEndDate &&
                    new Date(user?.membershipEndDate) >
                      new Date() && (
                      <span
                        style={{
                          fontSize: "16px",
                        }}
                      >
                        👑
                      </span>
                    )}
                </Link>

              {/* WALLET */}
              <Link
                to="/wallet"
                className="text-decoration-none"
              >
                <span className="badge bg-success">
                  💰 {user?.wallet || 0}
                </span>
              </Link>

              {/* ✅ LOGOUT ICON */}
              <button
                className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
                onClick={handleLogout}
                style={{ width: "32px", height: "32px", padding: 0 }}
              >
                <FaSignOutAlt size={14} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ================= DESKTOP MENU ================= */}
      <div className="bg-dark d-none d-md-block">
        <div className="container-fluid">
          <ul className="nav py-2 gap-3">
            {menuItems()}
          </ul>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className="collapse bg-dark" id="mobileMenu">
        <div className="p-3">

          {/* SEARCH */}
          <form className="mb-3">
            <input className="form-control" placeholder="Search..." />
          </form>

          {/* MENU */}
          <ul className="nav flex-column gap-2">
            {menuItems(true, closeMobileMenu)}
          </ul>

          <hr className="border-secondary" />

          {/* AUTH */}
          {!user || !token ? (
            <>
              <Link
                to="/login"
                className="text-white d-block mb-2"
                onClick={closeMobileMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-danger w-100"
                onClick={closeMobileMenu}
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <div className="text-white mb-2">
                👤 {user.username}
              </div>

              <div className="text-success mb-2">
                💰 Wallet: {user.wallet || 0}
              </div>

              

              <Link
                to="/profile"
                className="text-white d-block mb-2"
                onClick={closeMobileMenu}
              >
                Profile
              </Link>

              <Link
                to="/creator/dashboard"
                className="text-white d-block mb-2"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>

              <button
                className="btn btn-danger w-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}

/* ================= MENU ITEMS ================= */

const menuItems = (mobile = false, closeMenu) => (
  <>
    <li className="nav-item">
      <Link className="nav-link text-white" to="/" onClick={closeMenu}>
        🏠 HOME
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link text-danger fw-semibold" to="/liveuser" onClick={closeMenu}>
        🔴 LIVE SEX
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link text-warning fw-semibold" to="/premiumuser" onClick={closeMenu}>
        👑 PREMIUM USER
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link text-warning fw-semibold" to="/vipuser" onClick={closeMenu}>
        👑 VIP USER
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link text-white fw-semibold" to="/nudechat" onClick={closeMenu}>
        💬 NUDE CHAT
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link text-white fw-semibold" to="/creator" onClick={closeMenu}>
        ⭐ OUR CREATOR
      </Link>
    </li>
  </>
);

export default Header;