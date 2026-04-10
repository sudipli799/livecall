import React, { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "b0ffc84f85754dffa04866bd779ce1f0";

const channelName = "private_sudip";

const TOKEN =
  "007eJxTYDhdctig/NeH6ufNUztrnt76u1gjSiyhN/pcg0/zu6o/1zkVGJIM0tKSLUzSLEzNTU1S0tISDUwszMySUszNLZNTDdMMzI5ez3S7fD1zWnQ6MyMDIwMLAyMDCDCBSWYwyQImeRkKijLLEktS44tLUzILWBlMTQyMjAEgtyi2";

const UID = 54023;

export default function Agoracreator() {
  const clientRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const localTracksRef = useRef([]);

  useEffect(() => {
    const init = async () => {
      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      clientRef.current = client;

      await client.join(APP_ID, channelName, TOKEN, UID);

      const [micTrack, cameraTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      localTracksRef.current = [micTrack, cameraTrack];

      cameraTrack.play(localVideoRef.current);

      await client.publish([micTrack, cameraTrack]);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          if (user.videoTrack) {
            user.videoTrack.play(remoteVideoRef.current);
          }
        }

        if (mediaType === "audio") {
          if (user.audioTrack) {
            user.audioTrack.play();
          }
        }
      });

      client.on("user-unpublished", () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
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
  }, []);

  return (
    <div style={{ height: "100vh", background: "#000", position: "relative" }}>
      {/* Remote Video Full */}
      <div
        ref={remoteVideoRef}
        style={{
          width: "100%",
          height: "100vh",
          background: "#000",
        }}
      />

      {/* Local Video Small */}
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
          background: "#000",
        }}
      />

      {/* End Call */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <button
          className="btn btn-danger"
          onClick={async () => {
            localTracksRef.current.forEach((track) => {
              track.stop();
              track.close();
            });

            await clientRef.current?.leave();
            window.location.reload();
          }}
        >
          End Call
        </button>
      </div>
    </div>
  );
}