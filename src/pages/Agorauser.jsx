import React, { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "b0ffc84f85754dffa04866bd779ce1f0";

const channelName = "private_sudip";



const TOKEN =
  "007eJxTYIgN4t7yhId5ndfX+BdHrPNuiuw/HGxTdebHrdIJiTO9/ocpMCQZpKUlW5ikWZiam5qkpKUlGphYmJklpZibWyanGqYZmB29nul2+XrmTKk5rIwMjAwsDIwMIMAEJpnBJAuY5GUoKMosSyxJjS8uTcksYGWwMDAyNAEAHhMmtA==";

const UID = 80214;

export default function Agorauser() {

  const clientRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {

    const init = async () => {

      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8"
      });

      clientRef.current = client;

      await client.join(APP_ID, channelName, TOKEN, UID);

      // local camera
      const [micTrack, cameraTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      cameraTrack.play(localVideoRef.current);

      await client.publish([micTrack, cameraTrack]);

      // remote
      client.on("user-published", async (user, mediaType) => {

        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          user.videoTrack.play(remoteVideoRef.current);
        }

        if (mediaType === "audio") {
          user.audioTrack.play();
        }

      });

    };

    init();

    return () => {
      clientRef.current?.leave();
    };

  }, []);

  return (

    <div style={{ height: "100vh", background: "#000", position: "relative" }}>

      {/* Remote Full */}
      <div
        ref={remoteVideoRef}
        style={{
          width: "100%",
          height: "100vh",
          background: "#000"
        }}
      />

      {/* Local Small */}
      <div
        ref={localVideoRef}
        style={{
          width: "180px",
          height: "240px",
          position: "absolute",
          top: "20px",
          right: "20px",
          borderRadius: "10px",
          overflow: "hidden",
          border: "2px solid white",
          background: "#000"
        }}
      />

      {/* End Button */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <button className="btn btn-danger">
          End Call
        </button>
      </div>

    </div>
  );
}