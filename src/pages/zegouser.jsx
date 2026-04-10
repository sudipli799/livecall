import React, { useEffect, useState } from "react";
import axios from "axios";

const Muxuser = () => {
  const [playbackId, setPlaybackId] = useState(null);

  useEffect(() => {
    const fetchLive = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/live-status"
      );

      if (res.data.live) {
        setPlaybackId(res.data.playbackId);
      }
    };

    fetchLive();
  }, []);

  return (
    <div>
      <h2>Live Podcast</h2>

      {playbackId ? (
        <video
          controls
          autoPlay
          width="600"
          src={`https://stream.mux.com/${playbackId}.m3u8`}
        />
      ) : (
        <p>Live not started</p>
      )}
    </div>
  );
};

export default Muxuser;