import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";
import { useSelector, useDispatch } from "react-redux";
import { updateWallet } from "../redux/slices/authSlice";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";

export default function UserPrivateRoom() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const clientRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const localTracksRef = useRef([]);
  const isHandledRef = useRef(false); // 🔥 prevent multiple runs

  const [firebaseData, setFirebaseData] = useState(null);
  const [liveDuration, setLiveDuration] = useState(0);
  const [showData, setShowData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [showEndButton, setShowEndButton] = useState(false);
  const [showWalletRecharge, setShowWalletRecharge] = useState(false);

  const [rechargeAmount, setRechargeAmount] = useState(100);

  const [showRechargeBtn, setShowRechargeBtn] = useState(false);
  const [countdown, setCountdown] = useState(null);

  

  const AppID = "b0ffc84f85754dffa04866bd779ce1f0";

  const isStarted = firebaseData?.status === "started";

  // 📱 Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 Firebase Listener
  useEffect(() => {
    if (!id) return;

    const privateRef = ref(db, "privateShows/" + id);

    const unsubscribe = onValue(privateRef, (snapshot) => {
      if (snapshot.exists()) {
        setFirebaseData(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [id]);


  const handleWalletRecharge = async () => {

  if (!rechargeAmount || rechargeAmount < 1) {
    alert("Minimum recharge 1 tokens");
    return;
  }

  // 🔥 Razorpay script load
  const resScript = await loadRazorpayScript();

  if (!resScript) {
    alert("Razorpay SDK failed to load");
    return;
  }

  try {

    const res = await axiosInstance.post(
      ENDPOINTS.CREATE_RAZORPAY_ORDER,
      {
        user_id: user?._id,
        email: user?.email,
        phone: '7987256303',
        name: user?.name,
        amount: rechargeAmount
      }
    );

    const { order, key } = res.data;

    const options = {
      key: key,
      amount: order.amount,
      currency: order.currency,
      name: "Live App Wallet",
      description: "Wallet Recharge",
      order_id: order.id,

      handler: async function (response) {

        try {

          const verifyRes = await axiosInstance.post(
            ENDPOINTS.VERIFY_PAYMENT,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: rechargeAmount,
              user_id: user?._id
            }
          );

          alert("Wallet Recharged Successfully");

          dispatch(updateWallet(verifyRes.data.wallet));

          setShowWalletRecharge(false);

        } catch (error) {
          alert("Payment verification failed");
        }

      },

      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone
      },

      theme: {
        color: "#22c55e"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    alert("Payment failed");
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



const handleEndShow = async () => {
  try {
    if (!isStarted) return;

    // 🔥 calculate amount first
    const now = Date.now();
    const start = firebaseData.startTime;

    const seconds = Math.floor((now - start) / 1000);
    const minutes = Math.floor(seconds / 60);

    const amount = minutes * (showData?.token || 0);

    // ✅ 1. Backend call
    const res = await axiosInstance.put(
      `${ENDPOINTS.ENDSHOW}/${id}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "End API failed");
    }

    // ✅ 2. Wallet update
    dispatch(updateWallet(user.wallet - amount));

    // ✅ 3. Firebase update
    const privateRef = ref(db, "privateShows/" + id);

    await update(privateRef, {
      status: "ended",
      endTime: Date.now(),
    });

    console.log("✅ Firebase Updated");

    // ✅ 4. Stop Agora
    localTracksRef.current.forEach((track) => {
      track.stop();
      track.close();
    });

    await clientRef.current?.leave();

    // ✅ 5. Redirect
    navigate("/");

  } catch (error) {
    console.log("❌ End Error:", error?.response?.data || error.message);
  }
};

  // ⏱ Timer
  useEffect(() => {
    if (!isStarted) {
      setLiveDuration(0);
      return;
    }

    const interval = setInterval(() => {
      const seconds = Math.floor(
        (Date.now() - firebaseData.startTime) / 1000
      );
      setLiveDuration(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [firebaseData]);

  const totalMinutes = isStarted ? Math.floor(liveDuration / 60) : 0;
  const totalDeduction = isStarted
    ? totalMinutes * (showData?.token || 0)
    : 0;

  // 📦 Fetch Show Data
  const fetchShowDetail = async () => {
    try {
      const res = await axiosInstance.get(
        `${ENDPOINTS.PRIVATEREQUEST}/${id}`
      );
      setShowData(res?.data?.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchShowDetail();
  }, [id]);

  // 🎥 Agora Setup
  useEffect(() => {
    if (!showData) return;

    const init = async () => {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      await client.join(
        AppID,
        showData.channelName,
        showData.viewerToken,
        showData.viewerUid
      );

      const [micTrack, camTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      localTracksRef.current = [micTrack, camTrack];

      camTrack.play(localVideoRef.current);

      await client.publish([micTrack, camTrack]);

      setTimeout(() => {
        client.remoteUsers.forEach(async (user) => {
          if (user.hasVideo) {
            await client.subscribe(user, "video");

            const div = document.createElement("div");
            div.style.width = "100%";
            div.style.height = "100%";

            remoteVideoRef.current.innerHTML = "";
            remoteVideoRef.current.appendChild(div);

            user.videoTrack.play(div);
          }

          if (user.hasAudio) {
            await client.subscribe(user, "audio");
            user.audioTrack.play();
          }
        });
      }, 1000);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          remoteVideoRef.current.innerHTML = "";
          const div = document.createElement("div");
          div.style.width = "100%";
          div.style.height = "100%";
          remoteVideoRef.current.appendChild(div);
          user.videoTrack.play(div);
        }

        if (mediaType === "audio") user.audioTrack.play();
      });

      client.on("user-left", () => {
        remoteVideoRef.current.innerHTML = "";
      });
    };

    init();

    return async () => {
      localTracksRef.current.forEach((t) => {
        t.stop();
        t.close();
      });
      await clientRef.current?.leave();
    };
  }, [showData]);

  // 🔥 HANDLE COMPLETED STATUS
  useEffect(() => {
    if (!firebaseData || !showData) return;

    if (
      firebaseData.status === "completed" &&
      !isHandledRef.current
    ) {
      isHandledRef.current = true;

      // 🔥 SAME LOGIC AS LIVE (but correct amount)
      const now = Date.now();
      const start = firebaseData.startTime;

      const seconds = Math.floor((now - start) / 1000);
      const minutes = Math.ceil(seconds / 60);

      const amount = minutes * (showData?.token || 0);

      // ✅ EXACT SAME DISPATCH STYLE
      dispatch(updateWallet(user.wallet - amount));

      // ✅ Firebase update
      const privateRef = ref(db, "privateShows/" + id);
      update(privateRef, { status: "ended" });

      // ✅ Agora cleanup
      localTracksRef.current.forEach((t) => {
        t.stop();
        t.close();
      });

      clientRef.current?.leave();

      // ✅ Popup
      alert("📴 Video has been ended");
    }
  }, [firebaseData]);

  useEffect(() => {
  if (!firebaseData) return;

  if (firebaseData.status === "ended") {
    
    // 🔥 Stop Agora (safety)
    localTracksRef.current.forEach((t) => {
      t.stop();
      t.close();
    });

    clientRef.current?.leave();

    // 🔥 Hide video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = "";
    }

    // 🔥 Show popup
    setShowEndPopup(true);
  }
}, [firebaseData]);


useEffect(() => {
  if (liveDuration >= 60) {
    setShowEndButton(true);
  }
}, [liveDuration]);


useEffect(() => {
  if (!isStarted || !showData) return;

  const remainingWallet = user?.wallet - totalDeduction;
  const remain = showData.token * 100;

  if (remainingWallet < remain) {
    setShowRechargeBtn(true);   // 👈 button show hoga
  }
}, [liveDuration]);

// useEffect(() => {
//   if (!isStarted) return;

//   const remainingWallet = user?.wallet - totalDeduction;

//   if (remainingWallet < 10 && !showWalletRecharge) {
//     setShowWalletRecharge(true);
//   }
// }, [liveDuration]);


useEffect(() => {
  if (!isStarted || !showData || !firebaseData) return;

  const remainingWallet = user?.wallet - totalDeduction;
  const oneMinuteCost = showData.token*2;

  // 🔥 already handle ho chuka ho to dobara mat chalao
  if (isHandledRef.current) return;

  // 🔥 last 1 min ya usse kam balance
  if (remainingWallet <= oneMinuteCost) {
    console.log("⚠️ Low balance - Auto ending call");

    isHandledRef.current = true;

    handleEndShow(); // 🔥 AUTO CALL
  }

}, [liveDuration]);


useEffect(() => {
    if (!isStarted || !showData) return;

    const remainingWallet = user?.wallet - totalDeduction;

    const oneMin = showData.token;
    const twoMin = showData.token * 2;

    // 🔥 Already running ya handled ho chuka ho
    if (countdown !== null || isHandledRef.current) return;

    // 🔥 CONDITION: between 1 min & 2 min
    if (remainingWallet >= oneMin && remainingWallet < twoMin) {
      console.log("⏳ Countdown Started (60s)");

      setCountdown(60); // start from 60 sec
    }

  }, [liveDuration]);


  useEffect(() => {
  if (countdown === null) return;

    if (countdown <= 0) {
      console.log("❌ Countdown finished - ending call");

      if (!isHandledRef.current) {
        isHandledRef.current = true;
        handleEndShow(); // 🔥 AUTO END
      }

      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [countdown]);

  return (
    <div style={{ height: "100vh", background: "#000", position: "relative" }}>

      {/* DESKTOP INFO */}
      {!isMobile && showData && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          padding: "10px",
          borderRadius: "10px",
          color: "#fff",
          width: "240px"
        }}>
          <img
            src={showData.creator_id.profileImage}
            alt=""
            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
          />

          <div><strong>{showData.creator_id.name}</strong></div>
          <div>Type: {showData.type}</div>
          <div>Token/min: {showData.token}</div>

          <hr />

          {isStarted ? (
            <>
              <div>Duration: {liveDuration}s</div>
              <div>Minutes: {totalMinutes}</div>
              <div>💸 Spent: {totalDeduction}</div>
              <div>💰 Wallet Left: {user?.wallet - totalDeduction}</div>
            </>
          ) : (
            <div>🟡 Waiting...</div>
          )}
        </div>
      )}

      {/* MOBILE TOP */}
      {isMobile && (
        <div style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          padding: "8px 14px",
          borderRadius: "20px",
          color: "#fff",
          display: "flex",
          gap: "15px",
        }}>
          {isStarted ? (
            <>
              <span>⏱ {liveDuration}s</span>
              <span>💸 {totalDeduction}</span>
            </>
          ) : (
            <span>🟡 Waiting...</span>
          )}
        </div>
      )}

      {/* Remote */}
      {firebaseData?.status !== "ended" && (
        <div ref={remoteVideoRef} style={{ width: "100%", height: "100%" }} />
      )}

      {/* Local */}
      <div
        ref={localVideoRef}
        style={{
          width: isMobile ? "110px" : "180px",
          height: isMobile ? "150px" : "240px",
          position: "absolute",
          top: isMobile ? "60px" : "20px",
          right: "20px",
          borderRadius: "10px",
          overflow: "hidden",
          border: "2px solid white",
        }}
      />

        {countdown !== null && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "red",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "20px",
              zIndex: 50,
              fontWeight: "bold"
            }}
          >
            ⏳ Ending in {countdown}s
          </div>
        )}
      {/* Controls */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "10px",
        background: "rgba(0,0,0,0.5)",
        padding: "8px 12px",
        borderRadius: "30px"
      }}>

        

        <button
          className="btn btn-secondary"
          onClick={() => {
            const mic = localTracksRef.current[0];
            mic.setEnabled(!mic.enabled);
          }}
        >
          🎤
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            const cam = localTracksRef.current[1];
            cam.setEnabled(!cam.enabled);
          }}
        >
          📷
        </button>

        {showEndButton && (
            <button
              className="btn btn-danger"
              onClick={handleEndShow}
            >
              ❌ End
            </button>
          )}

          {showRechargeBtn && (
          <button
            className="btn btn-warning"
            onClick={() => setShowWalletRecharge(true)}
          >
            💰 Recharge
          </button>
        )}

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

                  {[100, 200, 500, 1000].map((amt) => (

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

      {showEndPopup && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              zIndex: 999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              flexDirection: "column",
            }}
          >
            <h2>📴 Call has been ended</h2>

            <button
              className="btn btn-light mt-3"
              onClick={() => window.location.reload()}
            >
              OK
            </button>
          </div>
        )}
    </div>
  );
}