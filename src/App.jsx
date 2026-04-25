import { useEffect, useState } from "react";
import Offline from "./pages/Offline";
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
import LiveUser from "./pages/LiveUser";
import PremiumUser from "./pages/PremiumUser";
import NudeChat from "./pages/NudeChat";
import Creators from "./pages/Creators";
import Profile from "./components/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCreators from "./pages/admin/AdminCreators";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminWithdraw from "./pages/admin/AdminWithdraw";
import AdminLive from "./pages/admin/AdminLive";
import AdminReports from "./pages/admin/AdminReports";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTransactionsTip from "./pages/admin/AdminTransactionsTip";
import AdminRechargeHistory from "./pages/admin/AdminRechargeHistory";
import CreatorWithdrawal from "./pages/CreatorWithdrawal";
import AdminAddAgent from "./pages/admin/AdminAddAgent";
import AdminAgent from "./pages/admin/AdminAgent";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentUsers from "./pages/agent/AgentUsers";
import AgentUserReports from "./pages/agent/AgentUserReports";
import AgentLive from "./pages/agent/AgentLive";
import AgentAddUser from "./pages/agent/AgentAddUser";
import CreatorPrivateRoom from "./pages/CreatorPrivateRoom";
import UserPrivateRoom from "./pages/UserPrivateRoom";
import MyShowRequest from "./pages/MyShowRequest";
import AdminPrivateShow from "./pages/admin/AdminPrivateShow";

function App() {
  const { token } = useSelector((state) => state.auth);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <Offline />;
  }

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
                <Route path="/liveuser" element={<LiveUser />} />
                <Route path="/premiumuser" element={<PremiumUser/>} />
                <Route path="/nudechat" element={<NudeChat/>} />
                <Route path="/creator" element={<Creators/>} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/creator-register" element={<CreatorRegister />} />
                <Route path="/category" element={<Category />} />
                {/* <Route path="/live" element={<Live />} /> */}
                <Route path="/private-show-creator/:id" element={<CreatorPrivateRoom />} />
                <Route path="/private-show-user/:id" element={<UserPrivateRoom />} />
                <Route path="/live/:id" element={<Live />} />
                <Route path="/live-viewer" element={<Profile />} />

                

              </Routes>
            </main>
            <Footer />
          </>
        }
      />

      {/* ============ PROTECTED ROUTES ============ */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/user" element={<AdminUsers />} />
      <Route path="/admin/creator" element={<AdminCreators />} />
      <Route path="/admin/transection" element={<AdminTransactions />} />
      <Route path="/admin/withdraw" element={<AdminWithdraw />} />
      <Route path="/admin/live" element={<AdminLive />} />
      <Route path="/admin/report" element={<AdminReports />} />
      <Route path="/admin/package" element={<AdminPackages />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/setting" element={<AdminSettings />} />
      <Route path="/admin/transactions/tip" element={<AdminTransactionsTip />} />
      <Route path="/admin/transactions/recharge" element={<AdminRechargeHistory />} />
      <Route path="/admin/add-agent" element={<AdminAddAgent />} />
      <Route path="/admin/agent" element={<AdminAgent />} />
      <Route path="/admin/private" element={<AdminPrivateShow />} />

      <Route path="/agent/dashboard" element={<AgentDashboard />} />
      <Route path="/agent/users" element={<AgentUsers />} />
      <Route path="/agent/reports" element={<AgentUserReports />} />
      <Route path="/agent/live" element={<AgentLive />} />
      <Route path="/agent/add-user" element={<AgentAddUser />} />


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

      <Route
        path="/creator/withdrawal"
        element={
          token ? <CreatorWithdrawal /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/creator/private-request"
        element={
          token ? <MyShowRequest /> : <Navigate to="/login" replace />
        }
      />

    </Routes>
  );
}

export default App;
