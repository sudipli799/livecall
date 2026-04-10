import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useDispatch, useSelector } from "react-redux";
import { getLiveStatus } from "../redux/slices/authSlice";

export default function LiveViewer() {

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const clientRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 FETCH LIVE STATUS
  const fetchLiveStatus = async () => {
    try {

      const response = await dispatch(
        getLiveStatus({ token })
      );

      const data = response.payload;

      if (!data.success) {
        setIsLoading(false);
        return;
      }

      // ⚫ OFFLINE
      if (data.liveStatus === 0 || !data.user.agora) {
        setIsLive(false);
        setIsLoading(false);
        return;
      }

      const agora = data.user.agora;

      console.log("Agora Viewer Data:", agora);

      // 🧹 Old Session Cleanup
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }

      // 🎥 Create Agora Client
      const client = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
      });

      clientRef.current = client;

      await client.setClientRole("audience");

      // 🔗 Join Channel
      await client.join(
        agora.appId,
        agora.channel,
        agora.token,
        null
      );

      console.log("Viewer joined");

      // 📡 Listen Creator Stream
      client.on("user-published", async (user, mediaType) => {

        await client.subscribe(user, mediaType);

        console.log("Subscribed:", mediaType);

        if (mediaType === "video") {
          user.videoTrack.play(remoteVideoRef.current);
        }

        if (mediaType === "audio") {
          user.audioTrack.play();
        }

        setIsLive(true);
        setIsLoading(false);
      });

      client.on("user-unpublished", () => {
        setIsLive(false);
      });

      client.on("user-left", () => {
        setIsLive(false);
      });

    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // 🔄 AUTO REFRESH LIVE STATUS
  useEffect(() => {

    if (!token) return;

    fetchLiveStatus();

    const interval = setInterval(() => {
      fetchLiveStatus();
    }, 5000); // 5 sec refresh

    return async () => {

      clearInterval(interval);

      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }

    };

  }, [token]);

  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column"
      style={{
        background: "radial-gradient(circle at top,#020617,#000)",
        color: "#fff",
      }}
    >

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary">

        <h4 className="fw-bold mb-0">📺 Live Viewer</h4>

        {isLive ? (
          <span className="badge bg-danger px-3 py-2 rounded-pill">
            🔴 LIVE
          </span>
        ) : (
          <span className="badge bg-secondary px-3 py-2 rounded-pill">
            OFFLINE
          </span>
        )}

      </div>

      {/* VIDEO */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center p-4">

        <div
          className="rounded-4 overflow-hidden position-relative"
          style={{
            background: "#000",
            width: "80%",
            height: "70vh",
            boxShadow: "0 0 40px rgba(236,72,153,.4)",
          }}
        >

          {/* VIDEO PLAYER */}
          <div
            ref={remoteVideoRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          />

          {/* LOADING */}
          {isLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black">
              <div className="text-center">
                <div className="spinner-border text-light mb-3"></div>
                <h5>Checking live stream...</h5>
              </div>
            </div>
          )}

          {/* OFFLINE */}
          {!isLive && !isLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black">
              <h4>Creator is offline ⚫</h4>
            </div>
          )}

        </div>

      </div>

      {/* CHAT */}
      <div
        className="p-3"
        style={{
          background: "#020617",
          borderTop: "1px solid #1e293b",
        }}
      >
        <div className="d-flex gap-2">

          <input
            className="form-control bg-dark text-white border-secondary"
            placeholder="Type message..."
          />

          <button className="btn btn-danger">
            Send
          </button>

        </div>
      </div>

    </div>
  );
}