// GoLive.jsx (FINAL – Everything Included)

import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useDispatch, useSelector } from "react-redux";
import { GoLiveVideo, getLiveStatus } from "../redux/slices/authSlice";
import AgoraRTC from "agora-rtc-sdk-ng";
import { db } from "../firebase";
import { ref, push, onChildAdded, off } from "firebase/database";

export default function GoLive() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [agoraData, setAgoraData] = useState(null);

  const [dailyLimit, setDailyLimit] = useState(0);
  const [getDailyLimit, setGetDailyLimit] = useState(0);
  const [tokenDate, setTokenDate] = useState(null);

  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const playerRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const [messages, setMessages] = useState([]);
const [messageInput, setMessageInput] = useState("");
const chatBoxRef = useRef(null);



  // 🔄 CHECK LIVE STATUS
const fetchLiveStatus = async () => {
  try {

    const response = await dispatch(
      getLiveStatus({ token })
    );

    const data = response.payload;

    console.log("Live Status:", data);

    if (!data.success) return;

    if (data.liveStatus === 1) {

      const agora = data.user.agora;

      setAgoraData(agora);

      setDailyLimit(data.user.dailyLimit);
      setTokenDate(data.user.tokenDate);

      // agar today hai to database value
      if (isTodayToken(data.user.tokenDate)) {
        setGetDailyLimit(data.user.getdailyLimit);
      } else {
        setGetDailyLimit(0);
      }

      const client = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
      });

      clientRef.current = client;

      await client.setClientRole("host");

      await client.join(
        agora.appId,
        agora.channel,
        agora.token,
        agora.uid
      );

      const [micTrack, camTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      localTracksRef.current = [micTrack, camTrack];

      camTrack.play(playerRef.current);

      await client.publish([micTrack, camTrack]);

      setIsLive(true);
      setIsEnded(false);
    }

  } catch (err) {
    console.log(err);
  }
};


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

const progress = dailyLimit
  ? Math.min((getDailyLimit / dailyLimit) * 100, 100)
  : 0;

const remaining = dailyLimit - getDailyLimit;

  // 🚀 START LIVE
  const startLive = async () => {
  try {
    console.log("Starting Live...");

    // 🧹 OLD SESSION CLEAN
    if (clientRef.current) {
      console.log("Cleaning old agora session");

      if (localTracksRef.current.length > 0) {
        localTracksRef.current.forEach((track) => {
          track.stop();
          track.close();
        });
      }

      localTracksRef.current = [];

      await clientRef.current.leave();

      clientRef.current = null;
    }

    // 🔁 Fetch live status from backend
    const response = await dispatch(GoLiveVideo({ token }));

    if (!response.payload.success) {
      alert("Live start failed");
      return;
    }

    const data = response.payload;

    if (data.liveStatus === 0) {
      console.log("Live status off");
      return;
    }

    const agora = data.agora;

    console.log("Agora Data:", agora);

    // 🎥 Create Agora Client
    const client = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
    });

    clientRef.current = client;

    // 👤 Host Role
    await client.setClientRole("host");

    // 🔗 Join Channel
    await client.join(
      agora.appId,
      agora.channel,
      agora.token,
      agora.uid
    );

    console.log("Joined channel");

    // 🎤 Camera + Mic
    const [micTrack, camTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks();

    localTracksRef.current = [micTrack, camTrack];

    // ▶️ Play Video
    if (playerRef.current) {
      camTrack.play(playerRef.current);
    }

    // 📡 Publish
    await client.publish([micTrack, camTrack]);

    console.log("Published tracks");

    setIsLive(true);
    setIsEnded(false);

    console.log("Live Started Successfully");

  } catch (error) {
    console.log("Agora Error:", error);
  }
};

  // ❌ END LIVE
  const handleEndStream = async () => {
    try {

      // stop tracks
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });

      localTracksRef.current = [];

      // leave agora
      await clientRef.current?.leave();

      clientRef.current = null;

      setIsLive(false);
      setIsEnded(true);

      await dispatch(GoLiveVideo({ token }));

      console.log("Stream ended");

      

    } catch (err) {
      console.log(err);
    }
  };

  // 🎤 MIC TOGGLE
  const toggleMic = async () => {
    const micTrack = localTracksRef.current[0];
    if (!micTrack) return;

    await micTrack.setEnabled(!micOn);
    setMicOn(!micOn);
  };

  // 📷 CAMERA TOGGLE
  const toggleCamera = async () => {
    const camTrack = localTracksRef.current[1];
    if (!camTrack) return;

    await camTrack.setEnabled(!camOn);

    if (camOn) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }

    setCamOn(!camOn);
  };

  const chatRoomId = user?._id;

  const sendMessage = async () => {

  if (!messageInput.trim()) return;

  if (!chatRoomId) return;

  const chatRef = ref(db, "liveChats/" + chatRoomId);

  await push(chatRef, {
    user: user?.username,
    text: messageInput,
    time: Date.now()
  });

  setMessageInput("");

};

  useEffect(() => {

    if (token) {
      fetchLiveStatus();
    }

    return async () => {

      console.log("Leaving GoLive page");

      // stop tracks
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });

      localTracksRef.current = [];

      // leave agora
      await clientRef.current?.leave();

      clientRef.current = null;
    };

  }, [token]);


  useEffect(() => {

  if (!chatRoomId) return;

  const chatRef = ref(db, "liveChats/" + chatRoomId);

  setMessages([]);

  onChildAdded(chatRef, (snapshot) => {

    const newMsg = {
      id: snapshot.key,
      ...snapshot.val()
    };

    setMessages((prev) => [...prev, newMsg]);

  });

  return () => off(chatRef);

}, [chatRoomId]);


useEffect(() => {

  if (chatBoxRef.current) {

    chatBoxRef.current.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth"
    });

  }

}, [messages]);

useEffect(() => {

  const interval = setInterval(() => {

    fetchLiveStatus();

  }, 5000);

  return () => clearInterval(interval);

}, []);

  return (
    <div className="container-fluid min-vh-100 p-0">
      <div className="row g-0 min-vh-100">
        <CreatorSidebar />

       

        <div
          className="col-12 col-md-9 col-lg-10 d-flex flex-column"
          style={{
            background: "radial-gradient(circle at top,#020617,#000)",
            color: "#fff",
          }}
        >
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary">
            <h4 className="fw-bold mb-0">🔴 Live Studio</h4>

            <div className="d-flex gap-3 align-items-center">
              {isLive && (
                <span className="badge bg-success px-3 py-2 rounded-pill">
                  ● LIVE
                </span>
              )}

              {!isLive ? (
                <button
                  onClick={startLive}
                  className="btn btn-danger btn-sm rounded-pill"
                >
                  Start Live
                </button>
              ) : (
                <button
                  onClick={handleEndStream}
                  className="btn btn-outline-light btn-sm rounded-pill"
                >
                  End Stream
                </button>
              )}
            </div>
          </div>

          {/* BODY */}
          <div className="flex-grow-1 d-flex">
            {/* VIDEO */}
            <div className="flex-grow-1 p-3 d-flex justify-content-center">
              <div
                className="rounded-4 overflow-hidden position-relative"
                style={{
                  background: "#000",
                  boxShadow: "0 0 40px rgba(236,72,153,.4)",
                  height: "70vh",
                  width: "100%",
                }}
              >
                <div
                  ref={playerRef}
                  style={{ width: "100%", height: "100%" }}
                ></div>

                {/* PAUSE OVERLAY */}
                {isPaused && !isEnded && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50">
                    <div className="spinner-border text-light mb-3"></div>
                    <h5>User video is paused</h5>
                  </div>
                )}

                {/* END OVERLAY */}
                {isEnded && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black">
                    <h4>User video call has been ended</h4>
                  </div>
                )}

                {/* CONTROLS */}
                {isLive && (
                  <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-3">
                    <button
                      onClick={toggleMic}
                      className={`btn btn-sm ${
                        micOn ? "btn-success" : "btn-danger"
                      } rounded-pill px-3`}
                    >
                      {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
                    </button>

                    <button
                      onClick={toggleCamera}
                      className={`btn btn-sm ${
                        camOn ? "btn-success" : "btn-danger"
                      } rounded-pill px-3`}
                    >
                      {camOn ? "📷 Cam On" : "⏸ Cam Off"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CHAT */}
            <div
              className="p-3"
              style={{
                width: 360,
                background: "#020617",
                borderLeft: "1px solid #1e293b",
              }}
            >
              <ul className="nav nav-pills mb-3">
                <li className="nav-item">
                  <button className="nav-link active">🌍 Public</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link">🔒 Private</button>
                </li>
              </ul>

             <div
                ref={chatBoxRef}
                className="rounded-3 p-3 mb-3"
                style={{
                  height: "60vh",
                  background: "#020617",
                  border: "1px solid #1e293b",
                  overflowY: "auto",
                }}
              >

                {messages.map((msg) => (

                  <div key={msg.id} className="mb-2">

                    <strong
                      className={
                        msg.user === user?.username
                          ? "text-danger"
                          : "text-warning"
                      }
                    >
                      {msg.user}:
                    </strong>

                    <span className="ms-2">{msg.text}</span>

                  </div>

                ))}

              </div>
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Type message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />

                <button
                  className="btn btn-danger btn-sm"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* TOKEN GOAL */}
          <div
              className="px-4 py-3 border-top border-secondary"
              style={{ background: "#020617" }}
            >
              {!isTodayToken(tokenDate) ? (
                <div className="text-warning fw-semibold">
                  🎯 Tip goal not set yet
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between mb-1">
                    <span>🎯 Token Goal</span>

                    <span className="fw-bold text-danger">
                      {getDailyLimit} / {dailyLimit} tk
                    </span>
                  </div>

                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <small className="text-light">
                    Remaining: {remaining > 0 ? remaining : 0} tokens
                  </small>
                </>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}