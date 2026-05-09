import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";

import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";

const COUNTRIES = ["India", "USA", "UK", "Canada", "Germany", "France"];

export default function Home() {

  const auth = useSelector((state) => state.auth);

  const [liveUsers, setLiveUsers] = useState([]);
  const [indiaUsers, setIndiaUsers] = useState([]);
  const [usaUsers, setUsaUsers] = useState([]);
  const [randomUsers, setRandomUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const res = await axiosInstance.get(ENDPOINTS.USERS);

      if (res?.data) {

        setLiveUsers(res.data.liveUsers || []);
        setIndiaUsers(res.data.indiaUsers || []);
        setUsaUsers(res.data.usaUsers || []);
        setRandomUsers(res.data.randomUsers || []);

      }

    } catch (error) {

      console.log("Error fetching users", error);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#fff"
        }}
      >

        <div
          className="spinner-border text-danger"
          style={{ width: 60, height: 60 }}
        />

        <p style={{ marginTop: 15, fontSize: 16 }}>
          Loading Live Creators...
        </p>

      </div>

    );

  }

  return (

    <div className="container-fluid px-1 mt-1">

      {/* MOBILE */}
      <div className="d-md-none">

        <LiveModelsRow users={liveUsers} auth={auth} />

        <MobileHeader />

        <VideoSection title="🔴 Live" users={liveUsers} auth={auth} />

        <VideoSection title="🇮🇳 Indian" users={indiaUsers} auth={auth} />

        <VideoSection title="🇺🇸 USA" users={usaUsers} auth={auth} />

        <VideoSection title="⭐ Relevant" users={randomUsers} auth={auth} />

        <LiveModelsRow users={liveUsers} auth={auth} />

      </div>

      {/* DESKTOP */}
      <div className="d-none d-md-block">

        <div className="row g-2">

          {/* SIDEBAR */}
          <div className="col-lg-3 col-md-4 sidebar-fixed">

            <div className="border rounded p-3">

              <h6 className="fw-bold">
                Search in orientations
              </h6>

              {["Straight", "Gay", "Transgender", "Couple", "Group"].map((o) => (

                <div className="form-check" key={o}>

                  <input className="form-check-input" type="checkbox" />

                  <label className="form-check-label">
                    {o}
                  </label>

                </div>

              ))}

              <h6 className="fw-bold mt-3">
                Country
              </h6>

              {COUNTRIES.map((c) => (

                <div className="form-check" key={c}>

                  <input className="form-check-input" type="checkbox" />

                  <label className="form-check-label">
                    {c}
                  </label>

                </div>

              ))}

              <h6 className="fw-bold mt-3">
                Minimum quality
              </h6>

              <div className="d-flex gap-2 flex-wrap">

                {["720p+", "1080p+", "2160p+"].map((q) => (

                  <button
                    key={q}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    {q}
                  </button>

                ))}

              </div>

              <h6 className="fw-bold mt-3">
                Sort by
              </h6>

              <select className="form-select">

                <option>Relevance</option>
                <option>Newest</option>
                <option>Most Viewed</option>

              </select>

            </div>

          </div>

          {/* CONTENT */}
          <div className="col-lg-9 col-md-8">

            <div className="border-bottom pb-2 mb-3">

              <div className="d-flex justify-content-between align-items-center">

                <h3 className="fw-bold mb-0">
                  xMaster Live Cam Indian Porn Videos
                </h3>

                <span className="text-muted">
                  363.7K Results
                </span>

              </div>

            </div>

            <DesktopSection
              title="🔴 Live Creator"
              users={liveUsers}
              live
              auth={auth}
            />

            <DesktopSection
              title="🇮🇳 Indian"
              users={indiaUsers}
              country="India"
              auth={auth}
            />

            <DesktopSection
              title="🇺🇸 USA"
              users={usaUsers}
              country="USA"
              auth={auth}
            />

            <DesktopSection
              title="⭐ Relevant"
              users={randomUsers}
              auth={auth}
            />

            <LiveModelsRow users={liveUsers} auth={auth} />

            <div className="mt-4 bg-light p-3 rounded">
            
                          <div className="d-flex justify-content-between align-items-center mb-2">
            
                            <h5 className="fw-bold mb-0">
            
                              Chat with{" "}
            
                              <span className="text-danger">
                                xMasterLive
                              </span>{" "}
            
                              girls now!
            
                            </h5>
            
                            <button className="btn btn-dark btn-sm">
                              More Girls
                            </button>
            
                          </div>
            
                          <div className="d-flex gap-2 overflow-auto no-scrollbar">
            
                            {liveUsers.map((user) => (
            
                              <Link
                                key={user._id}
                                to={`/live/${user._id}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                  minWidth: 200
                                }}
                              >
            
                                <div>
            
                                  <div className="position-relative">
            
                                    <PreviewPlayer
                                      user={user}
                                      auth={auth}
                                      height="130px"
                                    />
            
                                    <span className="badge bg-danger position-absolute top-0 start-0 m-1">
                                      ● Live
                                    </span>
            
                                  </div>
            
                                  <div className="fw-semibold small mt-1">
                                    {user.name}
                                    {" "}
                                    <span className="text-danger">
                                      ♀
                                    </span>
                                  </div>
            
                                  <div className="text-muted small">
                                    {user.country}
                                  </div>
            
                                </div>
            
                              </Link>
            
                            ))}
            
                          </div>
            
                        </div>

          </div>

        </div>

      </div>

    </div>

  );

}

/* ========================= */
/* COMPONENTS */
/* ========================= */

function MobileHeader() {

  return (

    <div className="d-flex justify-content-between align-items-center mb-1">

      <h6 className="fw-bold mb-0">
        xMaster Live Cam Indian Porn Videos
      </h6>

      <span className="text-muted small">
        Live Models
      </span>

    </div>

  );

}

function VideoSection({ title, users, auth }) {

  return (

    <>

      <h6 className="fw-bold mt-2">
        {title}
      </h6>

      <div className="row g-1 mb-2">

        {users.map((user, i) => (

          <div key={user._id} className="col-6">

            <VideoCard
              user={user}
              index={i}
              live
              auth={auth}
            />

          </div>

        ))}

      </div>

    </>

  );

}

function DesktopSection({ title, users, live, country, auth }) {

  return (

    <>

      <h6 className="fw-bold mt-3">
        {title}
      </h6>

      <div className="row g-2 mb-3">

        {users.map((user, i) => (

          <DesktopCard
            key={user._id}
            user={user}
            index={i}
            live={live}
            country={country}
            auth={auth}
          />

        ))}

      </div>

    </>

  );

}

function VideoCard({ user, live, auth }) {

  return (

    <Link
      to={`/live/${user._id}`}
      style={{
        textDecoration: "none",
        color: "inherit"
      }}
    >

      <div className="card border-0">

        <div className="position-relative">

          <PreviewPlayer user={user} auth={auth} />

          {live && (

            <span className="badge bg-danger position-absolute top-0 start-0 m-1">
              Live
            </span>

          )}

        </div>

        <div className="small fw-semibold mt-1">
          {user.name}
        </div>

        <div className="text-muted small">
          {user.country}
        </div>

      </div>

    </Link>

  );

}

function DesktopCard({ user, live, country, auth }) {

  return (

    <div className="col-xl-3 col-lg-4 col-md-6">

      <Link
        to={`/live/${user._id}`}
        style={{
          textDecoration: "none",
          color: "inherit"
        }}
      >

        <div className="card h-100">

          <div className="position-relative">

            <PreviewPlayer
              user={user}
              auth={auth}
              height="180px"
            />

            <span className="badge bg-danger position-absolute top-0 start-0 m-1">
              Live
            </span>

            {country && (

              <span className="badge bg-dark position-absolute top-0 end-0 m-1">
                {country}
              </span>

            )}

          </div>

          <div className="card-body p-2">

            <div className="fw-semibold">
              {user.name}
            </div>

            <div className="text-muted small">
              {user.country}
            </div>

            <div className="text-danger small fw-semibold">
              👁 Live Now
            </div>

          </div>

        </div>

      </Link>

    </div>

  );

}

function LiveModelsRow({ users }) {

  return (

    <div className="mb-3">

      <div className="fw-bold mb-1">

        Chat with{" "}
        <span className="text-danger">
          Live Models
        </span>

      </div>

      <div className="d-flex gap-2 overflow-auto no-scrollbar">

        {users.map((user) => (

          <Link
            key={user._id}
            to={`/live/${user._id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              minWidth: 70
            }}
          >

            <div className="text-center">

              <div className="position-relative">

                <img
                  src={
                    user.profileImage ||
                    "https://via.placeholder.com/150"
                  }
                  className="rounded-circle border border-2 border-danger"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover"
                  }}
                  alt=""
                />

                <span
                  className="position-absolute top-0 end-0 bg-danger rounded-circle"
                  style={{
                    width: 9,
                    height: 9
                  }}
                />

              </div>

              <div className="small mt-1">
                {user.name}
              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>

  );

}

/* ========================= */
/* PREVIEW PLAYER */
/* ========================= */

function PreviewPlayer({ user, auth, height = "220px" }) {

  const previewRef = useRef(null);

  const clientRef = useRef(null);

  const videoTrackRef = useRef(null);

  const [hovered, setHovered] = useState(false);

  const [cameraOff, setCameraOff] = useState(false);

  const isMembershipActive =
    auth?.user?.membershipStatus === 1;

  useEffect(() => {

    if (!hovered) return;

    if (!isMembershipActive) return;

    if (!user?.agora) return;

    let mounted = true;

    const startPreview = async () => {

      try {

        const client = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8"
        });

        clientRef.current = client;

        await client.join(
          user.agora.appId,
          user.agora.channel,
          user.agora.token,
          null
        );

        /* EXISTING USERS */
        client.remoteUsers.forEach(async (remoteUser) => {

          if (remoteUser.hasVideo) {

            try {

              await client.subscribe(remoteUser, "video");

              if (
                remoteUser.videoTrack &&
                mounted
              ) {

                setCameraOff(false);

                videoTrackRef.current =
                  remoteUser.videoTrack;

                remoteUser.videoTrack.play(
                  previewRef.current
                );

              }

            } catch (err) {
              console.log(err);
            }

          } else {

            setCameraOff(true);

          }

        });

        /* USER PUBLISHED */
        client.on(
          "user-published",
          async (remoteUser, mediaType) => {

            await client.subscribe(
              remoteUser,
              mediaType
            );

            if (
              mediaType === "video" &&
              remoteUser.videoTrack &&
              mounted
            ) {

              setCameraOff(false);

              videoTrackRef.current =
                remoteUser.videoTrack;

              remoteUser.videoTrack.play(
                previewRef.current
              );

            }

          }
        );

        /* CAMERA OFF */
        client.on(
          "user-unpublished",
          async (remoteUser, mediaType) => {

            if (mediaType === "video") {

              setCameraOff(true);

              try {

                if (videoTrackRef.current) {

                  videoTrackRef.current.stop();

                }

              } catch (err) {
                console.log(err);
              }

            }

          }
        );

        /* USER LEFT */
        client.on("user-left", () => {

          setCameraOff(true);

          try {

            if (videoTrackRef.current) {

              videoTrackRef.current.stop();

            }

          } catch (err) {
            console.log(err);
          }

        });

      } catch (error) {

        console.log("Preview Error", error);

      }
    };

    startPreview();

    return async () => {

      mounted = false;

      try {

        setCameraOff(false);

        if (videoTrackRef.current) {

          videoTrackRef.current.stop();

        }

        if (clientRef.current) {

          await clientRef.current.leave();

        }

      } catch (error) {

        console.log(error);

      }

    };

  }, [hovered, isMembershipActive, user]);

  return (

    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: 8,
        background: "#000",
        cursor: "pointer"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* LIVE VIDEO */}
      {hovered &&
      isMembershipActive &&
      !cameraOff ? (

        <div
          ref={previewRef}
          style={{
            width: "100%",
            height: "100%"
          }}
        />

      ) : (

        <img
          src={
            user.profileImage ||
            "https://via.placeholder.com/500x500"
          }
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />

      )}

      {/* CAMERA OFF MESSAGE */}
      {cameraOff && (

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.80)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            padding: 15
          }}
        >

          <div style={{ fontSize: 40 }}>
            📷
          </div>

          <div style={{ fontSize: 14 }}>
            Creator Camera Turned Off Now
          </div>

        </div>

      )}

      {/* LIVE PREVIEW TEXT */}
      {hovered &&
      isMembershipActive &&
      !cameraOff && (

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "6px 10px",
            background:
              "linear-gradient(transparent, rgba(0,0,0,0.8))",
            color: "#fff",
            fontSize: 12,
            fontWeight: "600"
          }}
        >

          🔴 Live Preview

        </div>

      )}

    </div>

  );
}