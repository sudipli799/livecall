import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
// import axiosInstance from "../api/axiosInstance";
// import ENDPOINTS  from "../api/endpoints";
// import { useSelector, useDispatch } from "react-redux";
import { updateWallet } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";



export default function CreatorPrivateRoom() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();


  const clientRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const localTracksRef = useRef([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const AppID = "b0ffc84f85754dffa04866bd779ce1f0";

  // ✅ STATE
  const [showData, setShowData] = useState(null);
  const [firebaseData, setFirebaseData] = useState(null);
  const [liveDuration, setLiveDuration] = useState(0);

  // ✅ SAFE STATUS
  const status = firebaseData?.status?.toLowerCase();
  const isStarted = status === "started";





  const handleEndShow = async () => {
    try {
      if (!isStarted) return;

      // ✅ 1. Backend call (IMPORTANT FIRST)
      const res = await axiosInstance.put(
        `${ENDPOINTS.ENDSHOW}/${id}`
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "End API failed");
      }

      // ✅ 2. Firebase update
      const privateRef = ref(db, "privateShows/" + id);

      await update(privateRef, {
        status: "completed",
        endTime: Date.now(),
      });

      console.log("✅ Show Ended");

      // ✅ 3. Leave agora
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });

      await clientRef.current?.leave();

      // ✅ optional reload / navigate
      navigate(`/creator/private-request`);

    } catch (error) {
      console.log("❌ End Error:", error?.response?.data || error.message);
    }
  };


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /*
  ==========================
  🔥 FIREBASE LISTEN
  ==========================
  */
  useEffect(() => {
    if (!id) return;

    const privateRef = ref(db, "privateShows/" + id);

    const unsubscribe = onValue(privateRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFirebaseData(data);

        console.log("🔥 Firebase Data:", data);
      } else {
        console.log("❌ No Firebase record found");
      }
    });

    return () => unsubscribe();
  }, [id]);

  /*
  ==========================
  ⏱ TIMER (ONLY WHEN STARTED)
  ==========================
  */
  useEffect(() => {
    if (!isStarted) {
      setLiveDuration(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const start = firebaseData?.startTime || now;

      const seconds = Math.floor((now - start) / 1000);
      setLiveDuration(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [firebaseData]);

  const totalMinutes = isStarted ? Math.floor(liveDuration / 60) : 0;
  const totalEarning =
    isStarted && showData?.token
      ? totalMinutes * showData.token
      : 0;

  /*
  ==========================
  🔥 START SHOW
  ==========================
  */
  const handleStartShow = async () => {
  try {
    if (status === "started") return;

    // ✅ 1. Backend update (IMPORTANT FIRST)
    const res = await axiosInstance.put(
      `${ENDPOINTS.STARTPRIVATESHOW}/${id}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "API failed");
    }

    // ✅ 2. Firebase update (sync after success)
    const privateRef = ref(db, "privateShows/" + id);

    await update(privateRef, {
      status: "started",
      startTime: Date.now(),
    });

    console.log("✅ Show Started");

  } catch (error) {
    console.log("❌ Start Error:", error?.response?.data || error.message);
  }
};

  /*
  ==========================
  🔥 FETCH API
  ==========================
  */
  const fetchShowDetail = async () => {
    try {
      const res = await axiosInstance.get(
        `${ENDPOINTS.PRIVATEREQUEST}/${id}`
      );

      if (res?.data?.data) {
        setShowData(res.data.data);

        console.log("Channel:", res.data.data.channelName);
        console.log("Creator Token:", res.data.data.creatorToken);
        console.log("Creator UID:", res.data.data.creatorUid);
      }
    } catch (error) {
      console.log("Error fetching private show:", error);
    }
  };

  useEffect(() => {
    fetchShowDetail();
  }, [id]);

  /*
  ==========================
  🔥 AGORA INIT
  ==========================
  */
  useEffect(() => {
    if (!showData) return;

    const init = async () => {
      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      clientRef.current = client;

      await client.join(
        AppID,
        showData.channelName,
        showData.creatorToken,
        showData.creatorUid
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

        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-left", () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
        }
      });
    };

    init();

    return async () => {
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });

      await clientRef.current?.leave();
    };
  }, [showData]);

  /*
  ==========================
  🎨 UI
  ==========================
  */
  return (
    <div style={{ height: "100vh", background: "#000", position: "relative" }}>

      {/* ================= DESKTOP VIEW ================= */}
      {!isMobile && showData && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 10,
            background: "rgba(0,0,0,0.6)",
            padding: "10px",
            borderRadius: "10px",
            color: "#fff",
            width: "240px",
          }}
        >
          <img
            src={showData.sender_id.profileImage}
            alt=""
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              marginBottom: "8px",
            }}
          />

          <div><strong>{showData.sender_id.name}</strong></div>
          <div>Type: {showData.type}</div>
          <div>Token/min: {showData.token}</div>

          <hr />

          <div style={{ fontSize: 12 }}>
            Raw Status: {firebaseData?.status || "N/A"}
          </div>

          {isStarted ? (
            <>
              <div>🟢 Live Started</div>
              <div>Duration: {liveDuration}s</div>
              <div>Minutes: {totalMinutes}</div>
              <div>💰 Earned: {totalEarning} tokens</div>
            </>
          ) : (
            <>
              <div>🟡 Waiting...</div>
              <button
                className="btn btn-success w-100 mt-2"
                onClick={handleStartShow}
              >
                ▶️ Start Show
              </button>
            </>
          )}

          <hr />
          <div>💰 My Wallet: {user?.wallet}</div>
        </div>
      )}

      {/* ================= MOBILE TOP BAR ================= */}
      {isMobile && (
        <div
          style={{
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
            fontSize: "14px",
          }}
        >
          {isStarted ? (
            <>
              <span>⏱ {liveDuration}s</span>
              <span>💰 {totalEarning}</span>
            </>
          ) : (
            <span>🟡 Waiting...</span>
          )}
        </div>
      )}

      {/* Remote Video */}
      <div ref={remoteVideoRef} style={{ width: "100%", height: "100%" }} />

      {/* ================= LOCAL VIDEO ================= */}
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

      {/* ================= CONTROLS ================= */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          gap: "10px",
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: "30px",
        }}
      >
        {/* WHEN STARTED */}
        {isStarted ? (
          <>
            {/* MIC */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                const mic = localTracksRef.current[0];
                const newState = !mic.enabled;
                mic.setEnabled(newState);
                setIsMicOn(newState);
              }}
            >
              {isMicOn ? "🎤" : "🔇"}
            </button>

            {/* CAMERA */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                const cam = localTracksRef.current[1];
                const newState = !cam.enabled;
                cam.setEnabled(newState);
                setIsCamOn(newState);
              }}
            >
              {isCamOn ? "📷" : "🚫📷"}
            </button>

            {/* END */}
            <button
              className="btn btn-danger"
              onClick={handleEndShow}
            >
              ❌ End
            </button>
          </>
        ) : (
          /* WHEN NOT STARTED (MOBILE + DESKTOP BOTH) */
          <button
            className="btn btn-success"
            onClick={handleStartShow}
          >
            ▶️ Start Show
          </button>
        )}
      </div>
    </div>
  );

}