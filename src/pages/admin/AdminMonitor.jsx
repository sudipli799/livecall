import React, { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";
import { useParams } from "react-router-dom";

export default function AdminMonitor() {
  const { id } = useParams();

  const clientRef = useRef(null);
  const creatorRef = useRef(null);
  const viewerRef = useRef(null);

  const AppID = "b0ffc84f85754dffa04866bd779ce1f0";

  useEffect(() => {
    let client;

    const init = async () => {
      try {
        // 🔥 API CALL
        const res = await axiosInstance.get(
          `${ENDPOINTS.PRIVATEREQUEST}/${id}`
        );

        const showData = res.data.data;

        if (!showData) {
          console.log("❌ No show data");
          return;
        }

        // 🔥 Agora client
        client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        clientRef.current = client;

        // ✅ ADMIN JOIN (IMPORTANT FIX)
        await client.join(
          AppID,
          showData.channelName,
          showData.adminToken, // 🔥 admin token
          showData.adminUid    // 🔥 admin uid
        );

        console.log("✅ Admin joined channel");

        // 🎯 HANDLE USER FUNCTION
        const handleUser = async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          // 🎥 VIDEO HANDLE
          if (mediaType === "video") {
            if (user.uid === showData.creatorUid) {
              if (creatorRef.current) {
                creatorRef.current.innerHTML = "";

                const div = document.createElement("div");
                div.style.width = "100%";
                div.style.height = "100%";

                creatorRef.current.appendChild(div);
                user.videoTrack.play(div);

                console.log("🎥 Creator video showing");
              }
            }

            else if (user.uid === showData.viewerUid) {
              if (viewerRef.current) {
                viewerRef.current.innerHTML = "";

                const div = document.createElement("div");
                div.style.width = "100%";
                div.style.height = "100%";

                viewerRef.current.appendChild(div);
                user.videoTrack.play(div);

                console.log("🎥 Viewer video showing");
              }
            }
          }

          // 🔊 AUDIO HANDLE
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        };

        // 🔥 EXISTING USERS
        client.remoteUsers.forEach(async (user) => {
          if (user.hasVideo) await handleUser(user, "video");
          if (user.hasAudio) await handleUser(user, "audio");
        });

        // 🔥 NEW USERS
        client.on("user-published", async (user, mediaType) => {
          await handleUser(user, mediaType);
        });

        // 🔥 USER LEFT
        client.on("user-left", (user) => {
          if (user.uid === showData.creatorUid) {
            if (creatorRef.current) creatorRef.current.innerHTML = "";
            console.log("❌ Creator left");
          } 
          else if (user.uid === showData.viewerUid) {
            if (viewerRef.current) viewerRef.current.innerHTML = "";
            console.log("❌ Viewer left");
          }
        });

      } catch (err) {
        console.log("❌ Error:", err);
      }
    };

    init();

    return async () => {
      try {
        await clientRef.current?.leave();
        console.log("👋 Admin left channel");
      } catch (e) {}
    };
  }, [id]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#000" }}>

      {/* 👑 CREATOR */}
      <div
        ref={creatorRef}
        style={{
          width: "50%",
          height: "100%",
          borderRight: "2px solid #222",
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "#fff",
          background: "rgba(0,0,0,0.6)",
          padding: "5px 10px",
          borderRadius: "10px"
        }}>
          👑 Creator
        </div>
      </div>

      {/* 👤 VIEWER */}
      <div
        ref={viewerRef}
        style={{
          width: "50%",
          height: "100%",
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "#fff",
          background: "rgba(0,0,0,0.6)",
          padding: "5px 10px",
          borderRadius: "10px"
        }}>
          👤 User
        </div>
      </div>

    </div>
  );
}