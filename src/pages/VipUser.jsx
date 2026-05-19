import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useDispatch, useSelector } from "react-redux";

import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";
import { updateWallet } from "../redux/slices/authSlice";

const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Germany",
  "France"
];

export default function VipUser() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);

  const [liveUsers, setLiveUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showWalletRecharge, setShowWalletRecharge] = useState(false);

  const [rechargeAmount, setRechargeAmount] = useState(100);
  

  const VipAccess = async (creator_id) => {

    console.log(auth.user.membershipStatus);

  // =========================
  // ULTIMATE MEMBER DIRECT ACCESS
  // =========================
  if (
    auth?.user?.membershipStatus === 1
  ) {

    navigate(`/live/${creator_id}`);

    return;

  }

  try {

    const res = await axiosInstance.post(
      ENDPOINTS.VIPACCESS,
      {
        user_id: auth?.user?._id,
        creator_id,
      }
    );

    // =========================
    // SUCCESS
    // =========================
    if (res?.data?.success) {

      // UPDATE REDUX WALLET
      dispatch(
        updateWallet(
          Number(res?.data?.remainingWallet || 0)
        )
      );

      // REDIRECT LIVE PAGE
      navigate(`/live/${creator_id}`);

      return;
    }

  } catch (error) {

    console.log(
      "VIP ACCESS ERROR",
      error
    );

    const message =
      error?.response?.data?.message;

    // =========================
    // VIP ALREADY ACTIVE
    // =========================
    if (
      message ===
      "VIP Access already active"
    ) {

      navigate(`/live/${creator_id}`);

      return;
    }

    // =========================
    // WALLET LOW
    // =========================
    if (
      message ===
      "Insufficient wallet balance"
    ) {

      setShowWalletRecharge(true);

      return;
    }

    // =========================
    // OTHER ERROR
    // =========================
    alert(
      message ||
      "Something went wrong"
    );

  }
};


const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const handleWalletRecharge = async () => {

  if (!rechargeAmount || rechargeAmount < 1) {
    alert("Minimum recharge 1 tokens");
    return;
  }

  if (rechargeAmount > 500) {
    alert("Maximum recharge limit is 500 tokens");
    return;
  }

  const resScript = await loadRazorpayScript();

  if (!resScript) {
    alert("Razorpay SDK failed to load");
    return;
  }

  // IMPORTANT
  if (!window.Razorpay) {
    alert("Razorpay not loaded");
    return;
  }

  try {

    const res = await axiosInstance.post(
      ENDPOINTS.CREATE_RAZORPAY_ORDER,
      {
        user_id: auth?.user?._id,
        email: auth?.user?.email,
        phone: auth?.user?.phone || "9999999999",
        name: auth?.user?.name,
        amount: Number(rechargeAmount)
      }
    );

    console.log("ORDER RESPONSE", res.data);

    const { order, key } = res.data;

    const options = {

      key: key,

      amount: order.amount,

      currency: order.currency,

      name: "Live App Wallet",

      description: "Wallet Recharge",

      order_id: order.id,

      handler: async function (response) {

        console.log("PAYMENT RESPONSE", response);

        try {

          const verifyRes = await axiosInstance.post(
            ENDPOINTS.VERIFY_PAYMENT,
            {
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,

              amount: Number(rechargeAmount),

              user_id: auth?.user?._id
            }
          );

          console.log("VERIFY RESPONSE", verifyRes.data);

          alert("Wallet Recharged Successfully");

          dispatch(
            updateWallet(
              verifyRes.data.wallet
            )
          );

          setShowWalletRecharge(false);

        } catch (error) {

          console.log(
            "VERIFY ERROR",
            error
          );

          alert("Payment verification failed");
        }

      },

      prefill: {

        name: auth?.user?.name,

        email: auth?.user?.email,

        contact:
          auth?.user?.phone || "9999999999"
      },

      theme: {
        color: "#22c55e"
      }

    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {

      console.log(
        "PAYMENT FAILED",
        response
      );

      alert("Payment Failed");
    });

    rzp.open();

  } catch (error) {

    console.log(
      "RECHARGE ERROR",
      error
    );

    alert(
      error?.response?.data?.message ||
      "Payment failed"
    );
  }
};

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {

    fetchUsers();

  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const res = await axiosInstance.get(
        ENDPOINTS.LIVEUSER
      );

      if (res?.data) {

        setLiveUsers(
          res.data.liveUsers || []
        );

      }

    } catch (error) {

      console.log(
        "Error fetching users",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // LOADER
  // =========================
  if (loading) {

    return (

      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#fff"
        }}
      >

        <div
          className="spinner-border text-danger"
          style={{
            width: 60,
            height: 60
          }}
        />

        <p
          style={{
            marginTop: 15,
            fontSize: 16
          }}
        >
          Loading Live Creators...
        </p>

      </div>

    );
  }

  return (
    <>

    <div className="container-fluid px-1 mt-1">

      {/* MOBILE */}
      <div className="d-md-none">

        <LiveModelsRow
          users={liveUsers}
          auth={auth}
          VipAccess={VipAccess}
        />

        <MobileHeader />

        <VideoSection
          title="🔴 Live"
          users={liveUsers}
          auth={auth}
          VipAccess={VipAccess}
        />

      </div>

      {/* DESKTOP */}
      <div className="d-none d-md-block">

        <div className="row g-2">

          {/* SIDEBAR */}
          <div className="col-lg-3 col-md-4 sidebar-fixed">

            <div className="border rounded p-3">

              <h6 className="fw-bold">
                Search in orientations
              </h6>

              {[
                "Straight",
                "Gay",
                "Transgender",
                "Couple",
                "Group"
              ].map((o) => (

                <div
                  className="form-check"
                  key={o}
                >

                  <input
                    className="form-check-input"
                    type="checkbox"
                  />

                  <label className="form-check-label">
                    {o}
                  </label>

                </div>

              ))}

              <h6 className="fw-bold mt-3">
                Country
              </h6>

              {COUNTRIES.map((c) => (

                <div
                  className="form-check"
                  key={c}
                >

                  <input
                    className="form-check-input"
                    type="checkbox"
                  />

                  <label className="form-check-label">
                    {c}
                  </label>

                </div>

              ))}

            </div>

          </div>

          {/* CONTENT */}
          <div className="col-lg-9 col-md-8">

            <div className="border-bottom pb-2 mb-3">

              <h3 className="fw-bold mb-0">
                VIP xMaster Live Cam
              </h3>

            </div>

            <DesktopSection
              title="🔴 Live"
              users={liveUsers}
              auth={auth}
              VipAccess={VipAccess}
            />

            <LiveModelsRow
              users={liveUsers}
              auth={auth}
              VipAccess={VipAccess}
            />

          </div>

        </div>

      </div>

    </div>
    

    {showWalletRecharge && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content rounded-4 p-4"
              style={{
                background: "linear-gradient(180deg,#0f172a,#020617)",
                color: "#fff",
                border: "1px solid #334155"
              }}
            >

              {/* Header */}
              <div className="text-center mb-3">

                <h4 className="fw-bold text-warning">
                  💰 Recharge Wallet
                </h4>

                <p className="text-light small">
                  Insufficient balance. Please recharge to continue.
                </p>

              </div>

              {/* Quick Amount */}
              <div className="mb-3">

                <div className="fw-semibold mb-2">
                  Select Amount
                </div>

                <div className="d-flex gap-2 flex-wrap">

                  {[50, 100, 200, 500].map((amt) => (

                    <button
                      key={amt}
                      className={`btn ${
                        rechargeAmount === amt
                          ? "btn-warning"
                          : "btn-outline-light"
                      }`}
                      onClick={() => setRechargeAmount(amt)}
                    >
                      {amt} Tokens
                    </button>

                  ))}

                </div>

              </div>

              {/* Manual Entry */}
              <div className="mb-3">

                <label className="form-label">
                  Enter Custom Amount
                </label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter tokens"
                  value={rechargeAmount}
                  onChange={(e) =>
                    setRechargeAmount(e.target.value)
                  }
                />

              </div>

              {/* Info */}
              <div className="bg-dark p-2 rounded mb-3 small">

                💡 1 Token = ₹1  
                <br />
                Secure payment gateway

              </div>

              {/* Buttons */}
              <div className="d-flex gap-2">

                <button
                  className="btn btn-secondary w-50"
                  onClick={() =>
                    setShowWalletRecharge(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success w-50 fw-bold"
                  onClick={handleWalletRecharge}
                >
                  Recharge {rechargeAmount} Tokens
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

</>

  );
}



/* ========================= */
/* MOBILE HEADER */
/* ========================= */

function MobileHeader() {

  return (

    <div className="d-flex justify-content-between align-items-center mb-1">

      <h6 className="fw-bold mb-0">
        xMaster Live Cam Indian Porn Videos
      </h6>

      <span className="text-muted small">
        Live Models
      </span>

    </div>

  );
}

/* ========================= */
/* VIDEO SECTION */
/* ========================= */

function VideoSection({
  title,
  users,
  auth,
  VipAccess
}) {

  return (

    <>

      <h6 className="fw-bold mt-2">
        {title}
      </h6>

      <div className="row g-1 mb-2">

        {users.map((user) => (

          <div
            key={user._id}
            className="col-6"
          >

            <VideoCard
              user={user}
              auth={auth}
              VipAccess={VipAccess}
            />

          </div>

        ))}

      </div>

    </>

  );
}

/* ========================= */
/* DESKTOP SECTION */
/* ========================= */

function DesktopSection({
  title,
  users,
  auth,
  VipAccess
}) {

  return (

    <>

      <h6 className="fw-bold mt-3">
        {title}
      </h6>

      <div className="row g-2 mb-3">

        {users.map((user) => (

          <DesktopCard
            key={user._id}
            user={user}
            auth={auth}
            VipAccess={VipAccess}
          />

        ))}

      </div>

    </>

  );
}

/* ========================= */
/* VIDEO CARD */
/* ========================= */

function VideoCard({
  user,
  auth,
  VipAccess
}) {

  return (

    <div
      onClick={() =>
        VipAccess(user._id)
      }
      style={{
        cursor: "pointer"
      }}
    >

      <div className="card border-0">

        <div className="position-relative">

          <PreviewPlayer
            user={user}
            auth={auth}
          />

          <span className="badge bg-danger position-absolute top-0 start-0 m-1">
            Live
          </span>

        </div>

        <div className="small fw-semibold mt-1">
          {user.name}
        </div>

        <div className="text-muted small">
          {user.country}
        </div>

      </div>

    </div>

  );
}

/* ========================= */
/* DESKTOP CARD */
/* ========================= */

function DesktopCard({
  user,
  auth,
  VipAccess
}) {

  return (

    <div className="col-xl-3 col-lg-4 col-md-6">

      <div
        onClick={() =>
          VipAccess(user._id)
        }
        style={{
          cursor: "pointer"
        }}
      >

        <div className="card h-100">

          <div className="position-relative">

            <PreviewPlayer
              user={user}
              auth={auth}
              height="180px"
            />

            <span className="badge bg-danger position-absolute top-0 start-0 m-1">
              Live
            </span>

          </div>

          <div className="card-body p-2">

            <div className="fw-semibold">
              {user.name}
            </div>

            <div className="text-muted small">
              {user.country}
            </div>

            <div className="text-danger small fw-semibold">
              👁 Live Now
            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

/* ========================= */
/* LIVE MODEL ROW */
/* ========================= */

function LiveModelsRow({
  users,
  auth,
  VipAccess
}) {

  return (

    <div className="mb-3">

      <div className="fw-bold mb-1">

        Chat with{" "}

        <span className="text-danger">
          Live Models
        </span>

      </div>

      <div className="d-flex gap-2 overflow-auto no-scrollbar">

        {users.map((user) => (

          <div
            key={user._id}
            onClick={() =>
              VipAccess(user._id)
            }
            style={{
              cursor: "pointer",
              minWidth: 70
            }}
          >

            <div className="text-center">

              <div className="position-relative">

                <img
                  src={user.profileImage}
                  className="rounded-circle border border-2 border-danger"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover"
                  }}
                  alt=""
                />

                <span
                  className="position-absolute top-0 end-0 bg-danger rounded-circle"
                  style={{
                    width: 9,
                    height: 9
                  }}
                />

              </div>

              <div className="small mt-1">
                {user.name}
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

/* ========================= */
/* PREVIEW PLAYER */
/* ========================= */

function PreviewPlayer({
  user,
  auth,
  height = "220px"
}) {

  const previewRef = useRef(null);

  const clientRef = useRef(null);

  const videoTrackRef = useRef(null);

  const [hovered, setHovered] =
    useState(false);

  const [cameraOff, setCameraOff] =
    useState(false);

  const [videoStarted, setVideoStarted] =
    useState(false);

  const isMembershipActive =
    auth?.user?.membershipStatus === 1;

  useEffect(() => {

    if (!hovered) return;

    if (!isMembershipActive) return;

    if (!user?.agora) return;

    let mounted = true;

    const startPreview = async () => {

      try {

        setCameraOff(false);

        setVideoStarted(false);

        const client =
          AgoraRTC.createClient({
            mode: "live",
            codec: "vp8"
          });

        clientRef.current = client;

        await client.join(
          user.agora.appId,
          user.agora.channel,
          user.agora.token,
          null
        );

        const checkTimer = setTimeout(() => {

          if (!videoStarted && mounted) {

            setCameraOff(true);

          }

        }, 2000);

        client.on(
          "user-published",
          async (
            remoteUser,
            mediaType
          ) => {

            await client.subscribe(
              remoteUser,
              mediaType
            );

            if (
              mediaType === "video" &&
              remoteUser.videoTrack &&
              mounted
            ) {

              clearTimeout(checkTimer);

              setCameraOff(false);

              setVideoStarted(true);

              videoTrackRef.current =
                remoteUser.videoTrack;

              remoteUser.videoTrack.play(
                previewRef.current
              );

            }

          }
        );

      } catch (error) {

        console.log(
          "Preview Error",
          error
        );

        setCameraOff(true);

      }
    };

    startPreview();

    return async () => {

      mounted = false;

      try {

        if (
          videoTrackRef.current
        ) {

          videoTrackRef.current.stop();

        }

        if (clientRef.current) {

          await clientRef.current.leave();

        }

      } catch (error) {

        console.log(error);

      }

    };

  }, [
    hovered,
    isMembershipActive,
    user
  ]);

  return (

    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: 8,
        background: "#000",
        cursor: "pointer"
      }}
      onMouseEnter={() =>
        setHovered(true)
      }
      onMouseLeave={() =>
        setHovered(false)
      }
    >

      {hovered &&
      isMembershipActive &&
      !cameraOff ? (

        <div
          ref={previewRef}
          style={{
            width: "100%",
            height: "100%"
          }}
        />

      ) : (

        <img
          src={
            user.profileImage ||
            "https://via.placeholder.com/500x500"
          }
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

      )}

      {cameraOff && (

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "rgba(0,0,0,0.80)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            padding: 15
          }}
        >

          <div
            style={{
              fontSize: 40
            }}
          >
            📷
          </div>

          <div
            style={{
              fontSize: 14
            }}
          >
            Creator Camera Turned Off
          </div>

        </div>

      )}

    </div>

  );
}