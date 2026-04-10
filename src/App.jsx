import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/* PUBLIC COMPONENTS */
import Header from "./components/Header";
import Footer from "./components/Footer";

/* PAGES */
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatorRegister from "./pages/CreatorRegister";
import Category from "./pages/Category";
import Live from "./pages/Live";

/* CREATOR */
import CreatorDashboard from "./pages/CreatorDashboard";
import GoLive from "./pages/GoLive";
// import ZegoCreator from "./pages/zegocreator";
// import ZegoUser from "./pages/zegouser";
import Muxcreator from "./pages/zegocreator";
import Muxuser from "./pages/zegouser";
import Agoracreator from "./pages/Agoracreator";
import Agorauser from "./pages/Agorauser";
import LiveViewer from "./pages/LiveViewer";
import TipMenu from "./pages/TipMenu";
import TipsHistory from "./pages/TipHistory";
import PrivateMenu from "./pages/PrivateMenu";

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>

      {/* ============ PUBLIC ROUTES ============ */}
      <Route
        path="/*"
        element={
          <>
            <Header />
            <main style={{ minHeight: "80vh" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/creator-register" element={<CreatorRegister />} />
                <Route path="/category" element={<Category />} />
                <Route path="/live" element={<Live />} />
                <Route path="/cr" element={<Agoracreator />} />
                <Route path="/uc" element={<Agorauser />} />
                <Route path="/live/:id" element={<Live />} />
                <Route path="/live-viewer" element={<LiveViewer />} />

              </Routes>
            </main>
            <Footer />
          </>
        }
      />

      {/* ============ PROTECTED ROUTES ============ */}
      <Route
        path="/creator/dashboard"
        element={
          token ? <CreatorDashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/creator/go-live"
        element={
          token ? <GoLive /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/creator/tip-menu"
        element={
          token ? <TipMenu /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/creator/earning"
        element={
          token ? <TipsHistory /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/creator/private"
        element={
          token ? <PrivateMenu /> : <Navigate to="/login" replace />
        }
      />

    </Routes>
  );
}

export default App;
