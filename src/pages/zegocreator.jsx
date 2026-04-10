import React, { useRef, useState } from "react";
import axios from "axios";

const Muxcreator = () => {
  const videoRef = useRef(null);
  const [playbackId, setPlaybackId] = useState("");
  const [streamKey, setStreamKey] = useState("");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoRef.current.srcObject = stream;
  };

  const startLive = async () => {
    const res = await axios.post(
      "http://localhost:5000/api/start-live"
    );

    setPlaybackId(res.data.playbackId);
    setStreamKey(res.data.streamKey);

    alert("Stream created. Use stream key in OBS.");
  };

  return (
    <div>
      <h2>Creator Live Panel</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "400px" }}
      />

      <br />

      <button onClick={startCamera}>Enable Camera & Mic</button>
      <button onClick={startLive}>Start Live</button>

      {streamKey && (
        <>
          <p>RTMP: rtmp://live.mux.com/app</p>
          <p>Stream Key: {streamKey}</p>
        </>
      )}

      {playbackId && (
        <p>Share Playback ID: {playbackId}</p>
      )}
    </div>
  );
};

export default Muxcreator;