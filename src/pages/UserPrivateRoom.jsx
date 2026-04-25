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
      </div>

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