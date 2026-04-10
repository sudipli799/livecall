// import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { db } from "../firebase";
import { ref, push, onChildAdded, off } from "firebase/database";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS  from "../api/endpoints";
import { useSelector, useDispatch } from "react-redux";
import { updateWallet } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Live() {

  const { id } = useParams();   // 👈 yaha se id aayegi

  console.log("Live ID:", id);
  const dispatch = useDispatch();

  const navigate = useNavigate();
const { user, token } = useSelector((state) => state.auth);
  // const [showPrivate, setShowPrivate] = useState(false);
  // const [showTip, setShowTip] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [activeTab, setActiveTab] = useState("tip");
  const [amount, setAmount] = useState(20);

  const clientRef = useRef(null);
const remoteVideoRef = useRef(null);

const [isCreatorMuted, setIsCreatorMuted] = useState(false);
const [isVideoPaused, setIsVideoPaused] = useState(false);

const [creator, setCreator] = useState(null);
const [indiaUsers, setIndiaUsers] = useState([]);
const [relatedUsers, setRelatedUsers] = useState([]);
const [loading, setLoading] = useState(true);

const [rechargeAmount, setRechargeAmount] = useState(100);

const [messages, setMessages] = useState([]);
const [messageInput, setMessageInput] = useState("");
const [tips, setTips] = useState([]);
const [selectedText, setSelectedText] = useState("");
const chatEndRef = useRef(null);
const chatBoxRef = useRef(null);

const [dailyLimit, setDailyLimit] = useState(0);
const [getdailyLimit, setGetDailyLimit] = useState(0);
const [tokenDate, setTokenDate] = useState(null);

const [showWalletRecharge, setShowWalletRecharge] = useState(false);

const isTodayToken = (date) => {

  if (!date) return false;

  const today = new Date();
  const tokenDay = new Date(date);

  return (
    today.getFullYear() === tokenDay.getFullYear() &&
    today.getMonth() === tokenDay.getMonth() &&
    today.getDate() === tokenDay.getDate()
  );
};

  const checkLogin = () => {

  if (!user || !token) {

    alert("Please login first");

    navigate("/login");

    return false;

  }

  return true;

};

  const fetchTips = async () => {
    try {
      const res = await axiosInstance.get(
        `${ENDPOINTS.TIP}/${id}`
      );

      if (res?.data?.data) {
        setTips(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching tips", error);
    }
  };

  

  const sendMessage = async () => {

    if (!messageInput.trim()) return;

    if (!id) {
      alert("Live ID missing");
      return;
    }

    const chatRef = ref(db, "liveChats/" + id);

    try {

      await push(chatRef, {
        user: user?.name || "viewer",
        text: messageInput,
        time: Date.now()
      });

      setMessageInput("");

    } catch (error) {

      console.log("Send Error:", error);

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


  const submitToken = async () => {

    if (!amount || !selectedText) {
      alert("Select tip first");
      return;
    }

    try {

      const res = await axiosInstance.post(
        ENDPOINTS.SUBMITTOKEN,
        {
          myid: id,
          token: amount,
          msg: selectedText,
          type: activeTab === "tip" ? "Tip" : "Toy",
          sender_id: user?._id
        }
      );

      const chatRef = ref(db, "liveChats/" + id);

      await push(chatRef, {
        user: user?.name || "viewer",
        text: `${selectedText} - ${amount} Tokens`,
        time: Date.now(),
        type: activeTab === "tip" ? "Tip" : "Toy",
      });

      setShowTip(false);
      setAmount("");
      setSelectedText("");

      // await fetchUserDetail();

      // ✅ wallet update
      dispatch(updateWallet(user.wallet-amount));

    } catch (error) {

      if (
        error?.response?.data?.message ===
        "Insufficient wallet balance"
      ) {
        setShowTip(false);
        setShowWalletRecharge(true);
        return;
      }

      alert(error?.response?.data?.message || "Something went wrong");
    }
  };

const startPrivateShow = async (type) => {

    if (!checkLogin()) return;

    let tokenAmount =
      type === "private"
        ? creator?.privateShowAmount
        : creator?.exclusiveShowAmount;

    if (!tokenAmount) {
      alert("Amount not set");
      return;
    }

    try {

      const res = await axiosInstance.post(
        ENDPOINTS.PRIVATESHOWREQUEST,
        {
          myid: id,
          token: tokenAmount,
          msg:
            type === "private"
              ? "Started Private Show"
              : "Started Exclusive Private Show",
          type:
            type === "private"
              ? "Private"
              : "Exclusive",
          sender_id: user?._id
        }
      );

      const chatRef = ref(db, "liveChats/" + id);

      await push(chatRef, {
        user: user?.name || "viewer",
        text:
          type === "private"
            ? `Started Private Show - ${tokenAmount} Tokens`
            : `Started Exclusive Private Show - ${tokenAmount} Tokens`,
        time: Date.now(),
        type: "Private"
      });

      alert("Private show started");

      setShowPrivate(false);

      // // await fetchUserDetail();

      // // ✅ wallet update
      // dispatch(updateWallet(user.wallet-tokenAmount));

    } catch (error) {

      if (
        error?.response?.data?.message ===
        "Insufficient wallet balance"
      ) {
        setShowPrivate(false);
        setShowWalletRecharge(true);
        return;
      }

      alert(error?.response?.data?.message || "Something went wrong");
    }
  };

const fetchUserDetail = async () => {
    try {

      const res = await axios.get(
        `http://localhost:5000/api/user/${id}`
      );

      setCreator(res.data.user);
      setIndiaUsers(res.data.indiaUsers);
      setRelatedUsers(res.data.relatedUsers);

      // 🎯 token goal
      setDailyLimit(res.data.user.dailyLimit);
      setTokenDate(res.data.user.tokenDate);

      if (isTodayToken(res.data.user.tokenDate)) {
        setGetDailyLimit(res.data.user.getdailyLimit);
      } else {
        setGetDailyLimit(0);
      }

      setLoading(false);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

  

  fetchUserDetail();

}, [id]);

const progress = dailyLimit
  ? Math.min((getdailyLimit / dailyLimit) * 100, 100)
  : 0;

const remaining = dailyLimit - getdailyLimit;

// wallet recharge
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

useEffect(() => {

  if (chatBoxRef.current) {

    chatBoxRef.current.scrollTop =
      chatBoxRef.current.scrollHeight;

  }

}, [messages]);

  useEffect(() => {

    if (!creator?.agora) return;

    const joinAsViewer = async () => {

      try {

        // 🔴 leave old client first
        if (clientRef.current) {

          await clientRef.current.leave();
          clientRef.current.removeAllListeners();
          clientRef.current = null;

        }

        const client = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8"
        });

        clientRef.current = client;

        await client.setClientRole("audience");

        await client.join(
          creator.agora.appId,
          creator.agora.channel,
          creator.agora.token,
          null // 🔥 viewer uid null
        );

        console.log("Viewer Joined");

        client.on("user-published", async (user, mediaType) => {

          console.log("Published:", mediaType);

          await client.subscribe(user, mediaType);

          if (mediaType === "video") {

            setIsVideoPaused(false);

            if (remoteVideoRef.current) {
              user.videoTrack.play(remoteVideoRef.current);
            }

          }

          if (mediaType === "audio") {

            user.audioTrack.play();
            setIsCreatorMuted(false);

          }

        });

        client.on("user-unpublished", (user, mediaType) => {

          if (mediaType === "audio") {
            setIsCreatorMuted(true);
          }

          if (mediaType === "video") {
            setIsVideoPaused(true);
          }

        });

        client.on("user-left", () => {

          setIsVideoPaused(true);

        });

      } catch (error) {

        console.log("Agora Join Error:", error);

      }
    };

    joinAsViewer();

    return async () => {

      if (clientRef.current) {

        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;

        console.log("Viewer Left");

      }

    };

  }, [creator?.agora]);

  useEffect(() => {

    if (!id) return;

    const chatRef = ref(db, "liveChats/" + id);

    setMessages([]);

    onChildAdded(chatRef, (snapshot) => {

      const newMsg = {
        id: snapshot.key,
        ...snapshot.val()
      };

      setMessages((prev) => [...prev, newMsg]);

    });

    return () => {
      off(chatRef);
    };

  }, [id]);


  useEffect(() => {
      if (id) {
        fetchTips();
      }
    }, [id]);

  return (
    <>
      {/* ================= MAIN ================= */}
      <div className="container-fluid bg-light py-3">
        <div className="row g-3">
          {/* VIDEO */}
          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-danger">LIVE</span>
            <strong>{creator?.name}</strong>

            
          </div>
          <div className="col-12 col-lg-7">
            <div className="bg-black rounded overflow-hidden position-relative">
              
                <div className="bg-black rounded overflow-hidden position-relative">

                  {isCreatorMuted && (
                    <div className="position-absolute top-0 start-0 m-2 text-danger fw-bold">
                      🔇 Creator Mic Muted
                    </div>
                  )}

                  <div className="ratio ratio-16x9 position-relative">

                    {/* 🔥 Agora Video */}
                    <div
                      ref={remoteVideoRef}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 2
                      }}
                    ></div>

                    {/* Existing iframe (not removed) */}
                    
                    {/* Pause Overlay */}
                    {isVideoPaused && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0,0,0,0.6)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#fff",
                          fontSize: "22px",
                          fontWeight: "bold",
                          zIndex: 3
                        }}
                      >
                        <div className="spinner-border text-light mb-3"></div>
                        Video is paused now
                      </div>
                    )}
                  </div>

                </div>
              

              <button className="btn btn-dark position-absolute bottom-0 start-50 translate-middle-x mb-3 rounded-pill px-4">
                Join Me for Free
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <div className="d-flex gap-2 align-items-center">
                <span className="badge bg-danger">LIVE</span>
                <strong>{creator?.username}</strong>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm">
                  ❤️ 5.9k
                </button>

                <button
                  className="btn btn-warning btn-sm fw-semibold"
                  onClick={() => {

                    if (!checkLogin()) return;

                    setShowPrivate(true);

                  }}
                >
                  Private Show {creator?.privateShowAmount} tk
                </button>

                <button
                  className="btn btn-success btn-sm fw-semibold"
                  onClick={() => {

                    if (!checkLogin()) return;

                    setShowTip(true);

                  }}
                >
                  Send Tip
                </button>
              </div>
            </div>

            <div className="mt-3">

              {!isTodayToken(tokenDate) ? (

                <div className="small fw-semibold text-warning">
                  🎯 Tip goal not set yet
                </div>

              ) : (

                <>
                  <div className="small fw-semibold">
                    🎯 Goal: {getdailyLimit} / {dailyLimit} tk
                  </div>

                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <small className="text-muted">
                    Remaining: {remaining > 0 ? remaining : 0} tokens
                  </small>
                </>

              )}

            </div>
          </div>

          {/* CHAT */}
          <div className="col-12 col-lg-5">
            <div className="bg-white rounded border h-100 d-flex flex-column">
              <div className="p-3 border-bottom d-flex justify-content-between">
                <strong>Public Chat</strong>
                <span className="text-muted">👥 16</span>
              </div>

              <div
  ref={chatBoxRef}
  className="p-3 overflow-auto"
  style={{
    height: "400px",
    background: "#fafafa"
  }}
>

  {messages.map((msg) => (

    <div
      key={msg.id}
      className="mb-2 p-2 bg-light rounded"
    >
      <strong className="text-danger">
        {msg.user}
      </strong> : {msg.text}
    </div>

  ))}

</div>

              <div className="border-top p-2 d-flex gap-2">
                <input
              className="form-control"
              placeholder="Public message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
                <button className="btn btn-dark" onClick={sendMessage}>➤</button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RELATED GIRLS ================= */}
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Related Girls</h5>

          <div className="row g-3">

            {relatedUsers.map((user) => (

              <div key={user._id} className="col-6 col-md-4 col-lg-2">

                <div className="rounded overflow-hidden border bg-white">

                  <img
                    src={
                      user.profileImage ||
                      "https://via.placeholder.com/300"
                    }
                    alt=""
                    className="w-100"
                    style={{ height: 150, objectFit: "cover" }}
                  />

                  <div className="p-2 text-center">

                    <strong>{user.username}</strong>

                    <br />

                    <small className="text-muted">
                      {user.country}
                    </small>

                    <br />

                    <a
                      href={`/live/${user._id}`}
                      className="btn btn-sm btn-dark mt-1"
                    >
                      Watch
                    </a>

                  </div>

                </div>
              </div>

            ))}

          </div>
        </div>

        {/* ================= INDIAN GIRLS ================= */}
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Indian Girls</h5>

          <div className="row g-3">

            {indiaUsers.map((user) => (

              <div key={user._id} className="col-6 col-md-4 col-lg-2">

                <div className="rounded overflow-hidden border bg-white">

                  <img
                    src={
                      user.profileImage ||
                      "https://via.placeholder.com/300"
                    }
                    alt=""
                    className="w-100"
                    style={{ height: 150, objectFit: "cover" }}
                  />

                  <div className="p-2 text-center">

                    <strong>{user.username}</strong>

                    <br />

                    <small className="text-muted">
                      {user.country}
                    </small>

                    <br />

                    <a
                      href={`/live/${user._id}`}
                      className="btn btn-sm btn-dark mt-1"
                    >
                      Watch
                    </a>

                  </div>

                </div>
              </div>

            ))}

          </div>
        </div>
      </div>

      {/* ================= PRIVATE MODAL ================= */}
      {showPrivate && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.7)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 p-3">
              <div className="d-flex justify-content-between mb-3">
                <h5>
                  Start a Private show with{" "}
                  <span className="text-danger">{creator?.token}</span>
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowPrivate(false)}
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-4 rounded bg-dark text-white h-100">
                    <h4 className="text-center">Private</h4>
                    <button
                      className="btn btn-warning w-100 my-3"
                      onClick={() => startPrivateShow("private")}
                    >
                      Start {creator?.privateShowAmount} tk / min
                    </button>
                    <ul className="small">
                      <li>One-on-one private show</li>
                      <li>Full attention</li>
                      <li>No public viewers</li>
                      <li>Minimum 10 minutes</li>
                    </ul>
                  </div>
                </div>

                <div className="col-md-6">
                  <div
                    className="p-4 rounded text-white h-100"
                    style={{
                      background:
                        "linear-gradient(180deg,#6a4b2c,#2b2b2b)",
                    }}
                  >
                    <h4 className="text-warning text-center">
                      Exclusive Private
                    </h4>
                    <button
                      className="btn btn-warning w-100 my-3"
                      onClick={() => startPrivateShow("exclusive")}
                    >
                      Start {creator?.exclusiveShowAmount} tk / min
                    </button>
                    <ul className="small">
                      <li>Everything in Private</li>
                      <li>Cam2Cam available</li>
                      <li>No spying</li>
                      <li>Highest priority</li>
                      <li>Minimum 10 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TIP MODAL ================= */}
      {showTip && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.7)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5>Send Tip</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowTip(false)}
                />
              </div>

              <div className="d-flex border-bottom">
                <button
                  className={`btn flex-fill ${
                    activeTab === "tip" ? "fw-bold" : ""
                  }`}
                  onClick={() => setActiveTab("tip")}
                >
                  Tip Menu
                </button>
                <button
                  className={`btn flex-fill ${
                    activeTab === "toy" ? "fw-bold" : ""
                  }`}
                  onClick={() => setActiveTab("toy")}
                >
                  Sexy Toy
                </button>
              </div>

              <div className="modal-body">
                {tips
                  ?.filter((item) =>
                    activeTab === "tip"
                      ? item.tiptype === "Tip"
                      : item.tiptype === "Toy"
                  )
                  ?.map((item) => (
                    <div
                      key={item._id}
                      className="d-flex justify-content-between py-2 border-bottom"
                      onClick={() => {
                        setAmount(item.amount);
                        setSelectedText(item.title);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{item.title}</span>
                      <strong>{item.amount} Tokens</strong>
                    </div>
                  ))}
              </div>

              <div className="px-3 pb-3">

                  {/* Hidden Text */}
                  <input
                    type="hidden"
                    value={selectedText}
                  />

                  {/* Amount */}
                  <input
                    className="form-control mb-3"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  {/* Button */}
                  <button
                    className="btn btn-success w-100 fw-semibold"
                    onClick={submitToken}
                  >
                    Send {amount} Tokens
                  </button>

                </div>
            </div>
          </div>
        </div>
      )}


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


    </>
  );
}
