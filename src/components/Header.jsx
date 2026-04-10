import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSearch } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

function Header() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {

    dispatch(logout());

    navigate("/login");

  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <nav className="navbar navbar-light bg-white border-bottom px-3">
        <div className="d-flex align-items-center gap-3">

          {/* MENU ICON (Mobile) */}
          <button
            className="btn d-md-none"
            data-bs-toggle="collapse"
            data-bs-target="#mobileMenu"
          >
            <FaBars size={20} />
          </button>

          <span className="fw-bold text-danger fs-4">
            XHAMSTER
          </span>
        </div>

        {/* SEARCH (Desktop only) */}
        <form className="d-none d-md-flex flex-grow-1 mx-4">
          <div className="input-group">
            <input
              className="form-control rounded-pill"
              placeholder="xhamster live cam indian"
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

          {/* ================= LOGIN CONDITION ================= */}

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

            <div className="dropdown">

              <button
                className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                data-bs-toggle="dropdown"
              >

                <strong>
                  {user.name}
                </strong>

                <span className="badge bg-success">
                  💰 {user.wallet || 0}
                </span>

              </button>

              <ul className="dropdown-menu dropdown-menu-end">

                <li>
                  <Link
                    className="dropdown-item"
                    to="/profile"
                  >
                    My Profile
                  </Link>
                </li>

                <li>
                  <Link
                    className="dropdown-item"
                    to="/wallet"
                  >
                    My Wallet
                  </Link>
                </li>

                <li>
                  <Link
                    className="dropdown-item"
                    to="/creator/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>

                <li>
                  <hr className="dropdown-divider" />
                </li>

                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>

              </ul>
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

      {/* ================= MOBILE COLLAPSE MENU ================= */}
      <div className="collapse bg-dark" id="mobileMenu">
        <div className="p-3">

          <form className="mb-3">
            <input
              className="form-control"
              placeholder="Search..."
            />
          </form>

          <ul className="nav flex-column gap-2">
            {menuItems(true)}
          </ul>

          <hr className="border-secondary" />

          {!user || !token ? (

            <>
              <Link
                to="/login"
                className="text-white d-block mb-2"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-danger w-100"
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
              >
                Profile
              </Link>

              <Link
                to="/creator/dashboard"
                className="text-white d-block mb-2"
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

/* ===== MENU ITEMS FUNCTION ===== */

const menuItems = (mobile = false) => (
  <>
    <li className="nav-item">
      <Link
        className={`nav-link text-white ${
          mobile ? "" : "fw-semibold"
        }`}
        to="/"
      >
        🏠 HOME
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-danger fw-semibold"
        to="/live"
      >
        🔴 LIVE SEX
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-warning fw-semibold"
        to="/"
      >
        👑 PREMIUM VIDEOS
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-white fw-semibold"
        to="/"
      >
        💬 NUDE CHAT
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-white fw-semibold"
        to="/category"
      >
        ☰ CATEGORIES
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-white fw-semibold"
        to="/"
      >
        ⭐ PORNSTARS
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-white fw-semibold"
        to="/"
      >
        📺 CHANNELS
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-white fw-semibold"
        to="/"
      >
        📷 PHOTOS
      </Link>
    </li>

    <li className="nav-item">
      <Link
        className="nav-link text-white fw-semibold"
        to="/"
      >
        ⬆️ UPLOAD
      </Link>
    </li>
  </>
);

export default Header;