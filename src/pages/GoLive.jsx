// GoLive.jsx (FINAL – Everything Included)

import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useDispatch, useSelector } from "react-redux";
import { GoLiveVideo, getLiveStatus } from "../redux/slices/authSlice";
import AgoraRTC from "agora-rtc-sdk-ng";
import { db } from "../firebase";
// import { ref, push, onChildAdded, off } from "firebase/database";

import {
  ref,
  push,
  onChildAdded,
  onValue,
  off,
  set
} from "firebase/database";

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



// ================= NEW STATES =================
const [chatTab, setChatTab] = useState("public");

const [privateUsers, setPrivateUsers] = useState([]);
const [selectedPrivateUser, setSelectedPrivateUser] = useState(null);

const [privateMessages, setPrivateMessages] = useState([]);
const [privateMessageInput, setPrivateMessageInput] = useState("");

const [unreadCounts, setUnreadCounts] = useState({});

const privateChatBoxRef = useRef(null);



const chatRoomId = user?._id;


// ================= NEW STATES =================
const [privateImage, setPrivateImage] = useState(null);


// ================= IMAGE UPLOAD =================
const handlePrivateImage = (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setPrivateImage(reader.result);
  };

  reader.readAsDataURL(file);

};

// ================= LOAD PRIVATE USERS =================
useEffect(() => {

  
  if (!chatRoomId) return;

  const privateRootRef = ref(
    db,
    `privateChats/${chatRoomId}`
  );

  setPrivateUsers([]);

  onChildAdded(privateRootRef, (snapshot) => {

    const userId = snapshot.key;

    if (!userId) return;

    // 🔥 user message room
    const roomRef = ref(
      db,
      `privateChats/${chatRoomId}/${userId}`
    );

    let lastMsg = null;
    let unread = 0;

    onChildAdded(roomRef, (msgSnap) => {

      const msg = msgSnap.val();

      lastMsg = msg;

      // 🔥 unread count
      // 🔥 unread count
if (
  !msg.read &&
  msg.senderType === "user"
) {
  unread++;
}

      setUnreadCounts((prev) => ({
        ...prev,
        [userId]: unread
      }));

      setPrivateUsers((prev) => {

        const filtered = prev.filter(
          (u) => u.userId !== userId
        );

        return [
          {
            userId,
            name: msg.user || "User",
            lastMessage: msg.text || "📷 Image",
            lastTime: msg.time || Date.now()
          },
          ...filtered
        ].sort((a, b) => b.lastTime - a.lastTime);

      });

    });

  });

  return () => {
    off(privateRootRef);
  };

}, [chatRoomId]);


// 🔥 AUTO READ UPDATE (CREATOR OPEN CHAT)
useEffect(() => {

  if (!selectedPrivateUser) return;

  const privateRef = ref(
    db,
    `privateChats/${chatRoomId}/${selectedPrivateUser}`
  );

  const unsubscribe = onValue(
    privateRef,
    async (snapshot) => {

      const data = snapshot.val();

      if (!data) {
        setPrivateMessages([]);
        return;
      }

      const msgs = Object.entries(data).map(
        ([key, value]) => ({
          id: key,
          ...value
        })
      );

      msgs.sort((a, b) => a.time - b.time);

      setPrivateMessages(msgs);

      // ✅ READ UPDATE
      msgs.forEach((msg) => {

        if (
          msg.senderType === "user" &&
          msg.read !== true
        ) {

          const msgRef = ref(
            db,
            `privateChats/${chatRoomId}/${selectedPrivateUser}/${msg.id}`
          );

          set(msgRef, {
            ...msg,
            read: true
          });

        }

      });

    }
  );

  // ✅ unread clear
  setUnreadCounts((prev) => ({
    ...prev,
    [selectedPrivateUser]: 0
  }));

  return () => unsubscribe();

}, [selectedPrivateUser, chatRoomId]);
// ================= LOAD PRIVATE MESSAGES =================
useEffect(() => {

  if (!selectedPrivateUser) return;

  const privateRef = ref(
    db,
    `privateChats/${chatRoomId}/${selectedPrivateUser}`
  );

  setPrivateMessages([]);

  onChildAdded(privateRef, async (snapshot) => {

    const msg = {
      id: snapshot.key,
      ...snapshot.val()
    };

    setPrivateMessages((prev) => [...prev, msg]);

  });

  // 🔥 unread clear
  setUnreadCounts((prev) => ({
    ...prev,
    [selectedPrivateUser]: 0
  }));

  return () => {
    off(privateRef);
  };

}, [selectedPrivateUser]);

// ================= AUTO SCROLL =================
useEffect(() => {

  if (privateChatBoxRef.current) {

    privateChatBoxRef.current.scrollTop =
      privateChatBoxRef.current.scrollHeight;

  }

}, [privateMessages]);


// ================= SEND PRIVATE MESSAGE =================
// ================= SEND PRIVATE MESSAGE =================
const sendPrivateMessage = async () => {

  if (
    !privateMessageInput.trim() &&
    !privateImage
  ) return;

  if (!selectedPrivateUser) return;

  const privateRef = ref(
    db,
    `privateChats/${chatRoomId}/${selectedPrivateUser}`
  );

  await push(privateRef, {
    user: user?.username,
    text: privateMessageInput || "",
    image: privateImage || "",
    time: Date.now(),
    senderId: user?._id,
    senderType: "creator", // 🔥 creator
    read: false
  });

  setPrivateMessageInput("");
  setPrivateImage(null);

};



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

  // const chatRoomId = user?._id;

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
          <div className="flex-grow-1 d-flex flex-column flex-md-row">
            {/* VIDEO */}
            <div className="flex-grow-1 p-2 p-md-3 d-flex justify-content-center">
              <div
                className="rounded-4 overflow-hidden position-relative"
                style={{
                  background: "#000",
                  boxShadow: "0 0 40px rgba(236,72,153,.4)",
                  height: window.innerWidth < 768 ? "40vh" : "70vh",
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
            {/* CHAT */}
<div
  className="p-2 p-md-3"
  style={{
    width: "100%",
    maxWidth: 360,
    background: "#020617",
    borderLeft:
      window.innerWidth >= 768
        ? "1px solid #1e293b"
        : "none",
    borderTop:
      window.innerWidth < 768
        ? "1px solid #1e293b"
        : "none",
  }}
>

  {/* TABS */}
  <ul className="nav nav-pills mb-3">

    <li className="nav-item me-2">

      <button
        onClick={() => setChatTab("public")}
        className={`nav-link ${
          chatTab === "public"
            ? "active"
            : ""
        }`}
      >
        🌍 Public
      </button>

    </li>

    <li className="nav-item">

      <button
        onClick={() => setChatTab("private")}
        className={`nav-link ${
          chatTab === "private"
            ? "active"
            : ""
        }`}
      >
        🔒 Private

        {Object.values(unreadCounts).reduce(
          (a, b) => a + b,
          0
        ) > 0 && (

          <span className="badge bg-danger ms-2">

            {Object.values(unreadCounts).reduce(
              (a, b) => a + b,
              0
            )}

          </span>

        )}

      </button>

    </li>

  </ul>

  {/* ================= PUBLIC CHAT ================= */}
  {chatTab === "public" && (
    <>

      <div
        ref={chatBoxRef}
        className="rounded-3 p-3 mb-3"
        style={{
          height:
            window.innerWidth < 768
              ? "40vh"
              : "60vh",
          background: "#020617",
          border: "1px solid #1e293b",
          overflowY: "auto",
        }}
      >

        {messages.map((msg) => (

          <div
            key={msg.id}
            className="mb-2"
          >

            <strong
              className={
                msg.user === user?.username
                  ? "text-danger"
                  : "text-warning"
              }
            >
              {msg.user}:
            </strong>

            <span className="ms-2">
              {msg.text}
            </span>

          </div>

        ))}

      </div>

      <div className="d-flex gap-2">

        <input
          className="form-control form-control-sm bg-dark text-white border-secondary"
          placeholder="Type message..."
          value={messageInput}
          onChange={(e) =>
            setMessageInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter")
              sendMessage();
          }}
        />

        <button
          className="btn btn-danger btn-sm"
          onClick={sendMessage}
        >
          Send
        </button>

      </div>

    </>
  )}

  {/* ================= PRIVATE CHAT ================= */}
  {chatTab === "private" && (

    <div className="d-flex flex-column h-100">

      {/* USER LIST */}
      {!selectedPrivateUser && (

        <div
          style={{
            height:
              window.innerWidth < 768
                ? "45vh"
                : "65vh",
            overflowY: "auto"
          }}
        >

          {privateUsers.length === 0 && (

            <div className="text-center text-muted mt-5">
              No private chats
            </div>

          )}

          {privateUsers.map((u) => (

            <div
              key={u.userId}
              onClick={() =>
                setSelectedPrivateUser(
                  u.userId
                )
              }
              className="p-3 mb-2 rounded"
              style={{
                background: "#0f172a",
                cursor: "pointer",
                border:
                  "1px solid #1e293b"
              }}
            >

              <div className="d-flex justify-content-between">

                <strong className="text-light">
                  {u.name}
                </strong>

                {unreadCounts[u.userId] >
                  0 && (

                  <span className="badge bg-danger">

                    {
                      unreadCounts[
                        u.userId
                      ]
                    }

                  </span>

                )}

              </div>

              <div
                className="text-secondary small text-truncate"
              >
                {u.lastMessage}
              </div>

            </div>

          ))}

        </div>

      )}

      {/* MESSAGE BOX */}
      {selectedPrivateUser && (
        <>

          {/* HEADER */}
          <div className="d-flex align-items-center justify-content-between mb-2">

            <button
              className="btn btn-sm btn-outline-light"
              onClick={() =>
                setSelectedPrivateUser(null)
              }
            >
              ← Back
            </button>

            <strong>
              Private Chat
            </strong>

          </div>

          {/* MESSAGES */}
          {/* MESSAGES */}
<div
  ref={privateChatBoxRef}
  className="rounded-3 p-3 mb-3"
  style={{
    height:
      window.innerWidth < 768
        ? "35vh"
        : "55vh",
    background: "#020617",
    border:
      "1px solid #1e293b",
    overflowY: "auto",
  }}
>

  {privateMessages.map((msg) => (

    <div
      key={msg.id}
      className={`mb-3 d-flex ${
        msg.senderType === "creator"
          ? "justify-content-end"
          : "justify-content-start"
      }`}
    >

      <div
        style={{
          maxWidth: "80%",
          background:
            msg.senderType === "creator"
              ? "#dc3545"
              : "#1e293b",
          color: "#fff",
          padding:
            "10px 14px",
          borderRadius: 14,
          wordBreak:
            "break-word"
        }}
      >

        {/* USER NAME */}
        <div className="small fw-bold mb-1">

          {msg.senderType === "creator"
            ? "👑 You"
            : `💖 ${msg.user}`}

        </div>

        {/* TEXT */}
        {msg.text && (
          <div>
            {msg.text}
          </div>
        )}

        {/* IMAGE */}
        {msg.image && (
          <img
            src={msg.image}
            alt="chat-img"
            style={{
              width: "100%",
              maxWidth: "220px",
              borderRadius: "10px",
              marginTop: "8px",
              objectFit: "cover"
            }}
          />
        )}

        {/* READ STATUS */}
        {msg.senderType === "creator" && (
          <div
            className="text-end mt-1"
            style={{
              fontSize: 11,
              opacity: 0.8
            }}
          >
            {msg.read ? "✓✓ Seen" : "✓ Sent"}
          </div>
        )}

      </div>

    </div>

  ))}

</div>

          {/* INPUT */}
          {/* INPUT */}
<div className="d-flex flex-column gap-2">

  {/* IMAGE PREVIEW */}
  {privateImage && (

    <div>

      <img
        src={privateImage}
        alt=""
        style={{
          width: 80,
          borderRadius: 10
        }}
      />

    </div>

  )}

  <div className="d-flex gap-2">

    {/* IMAGE BUTTON */}
    <label className="btn btn-outline-light btn-sm mb-0">

      📷

      <input
        type="file"
        hidden
        accept="image/*"
        onChange={handlePrivateImage}
      />

    </label>

    {/* INPUT */}
    <input
      className="form-control form-control-sm bg-dark text-white border-secondary"
      placeholder="Type private message..."
      value={privateMessageInput}
      onChange={(e) =>
        setPrivateMessageInput(
          e.target.value
        )
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendPrivateMessage();
        }
      }}
    />

    {/* SEND */}
    <button
      className="btn btn-danger btn-sm"
      onClick={
        sendPrivateMessage
      }
    >
      Send
    </button>

  </div>

</div>

        </>
      )}

    </div>

  )}

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