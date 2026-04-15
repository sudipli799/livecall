import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


const COUNTRIES = ["India", "USA", "UK", "Canada", "Germany", "France"];

export default function LiveUser() {
  const [liveUsers, setLiveUsers] = useState([]);
  

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/liveusers");

      setLiveUsers(res.data.liveUsers || []);
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid px-1 mt-1">

      {/* MOBILE */}
      <div className="d-md-none">

        <LiveModelsRow users={liveUsers} />

        <MobileHeader />

        <VideoSection title="🔴 Live" users={liveUsers} />
        
      </div>

      {/* DESKTOP */}
      <div className="d-none d-md-block">
        <div className="row g-2">

          {/* SIDEBAR */}
          <div className="col-lg-3 col-md-4 sidebar-fixed">
            <div className="border rounded p-3">
              <h6 className="fw-bold">Search in orientations</h6>
              {["Straight", "Gay", "Transgender", "Couple", "Group"].map(o => (
                <div className="form-check" key={o}>
                  <input className="form-check-input" type="checkbox" />
                  <label className="form-check-label">{o}</label>
                </div>
              ))}

              <h6 className="fw-bold mt-3">Country</h6>
              {COUNTRIES.map(c => (
                <div className="form-check" key={c}>
                  <input className="form-check-input" type="checkbox" />
                  <label className="form-check-label">{c}</label>
                </div>
              ))}

              <h6 className="fw-bold mt-3">Minimum quality</h6>
              <div className="d-flex gap-2 flex-wrap">
                {["720p+", "1080p+", "2160p+"].map(q => (
                  <button key={q} className="btn btn-outline-secondary btn-sm">
                    {q}
                  </button>
                ))}
              </div>

              <h6 className="fw-bold mt-3">Sort by</h6>
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
                {/* <span className="text-muted">363.7K Results</span> */}
              </div>

              
            </div>

            <DesktopSection title="🔴 Live" users={liveUsers} live />
           
            <LiveModelsRow users={liveUsers} />
              <div className="mt-4 bg-light p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">
                    Chat with <span className="text-danger">xMasterLive</span> girls now!
                  </h5>
                  <button className="btn btn-dark btn-sm">More Girls</button>
                </div>

                <div className="d-flex gap-2 overflow-auto no-scrollbar">
                  {liveUsers.map((user, i) => (
                    <Link
                      key={user._id}
                      to={`/live/${user._id}`}
                      style={{ textDecoration: "none", color: "inherit", minWidth: 200 }}
                    >
                      <div>

                        <div className="position-relative">
                          <img
                            src={user.profileImage}
                            className="img-fluid rounded"
                            style={{
                              height: 130,
                              width: "100%",
                              objectFit: "cover"
                            }}
                            alt=""
                          />

                          <span className="badge bg-danger position-absolute top-0 start-0 m-1">
                            ● Live
                          </span>
                        </div>

                        <div className="fw-semibold small mt-1">
                          {user.name} <span className="text-danger">♀</span>
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

/* COMPONENTS */

function MobileHeader() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h6 className="fw-bold mb-0">
          xMaster Live Cam Indian Porn Videos
        </h6>
        <span className="text-muted small">Live Models</span>
      </div>
    </>
  );
}

function VideoSection({ title, users }) {
  return (
    <>
      <h6 className="fw-bold mt-2">{title}</h6>
      <div className="row g-1 mb-2">
        {users.map((user, i) => (
          <div key={user._id} className="col-6">
            <VideoCard user={user} index={i} live />
          </div>
        ))}
      </div>
    </>
  );
}

function DesktopSection({ title, users, live, country }) {
  return (
    <>
      <h6 className="fw-bold mt-3">{title}</h6>

      <div className="row g-2 mb-3">
        {users.map((user, i) => (
          <DesktopCard
            key={user._id}
            user={user}
            index={i}
            live={live}
            country={country}
          />
        ))}
      </div>
    </>
  );
}

function VideoCard({ user, index, live }) {
  return (
    <Link
      to={`/live/${user._id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="card border-0">

        <div className="position-relative">
          <img
            src={user.profileImage}
            className="img-fluid rounded"
            alt=""
          />

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

function DesktopCard({ user, live, country, index }) {
  return (
    <div className="col-xl-3 col-lg-4 col-md-6">

      <Link
        to={`/live/${user._id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="card h-100">

          <div className="position-relative">
            <img
              src={user.profileImage}
              className="card-img-top"
              alt=""
              style={{
                height: "180px",
                width: "100%",
                objectFit: "cover",
              }}
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
            <div className="fw-semibold">{user.name}</div>

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
        Chat with <span className="text-danger">Live Models</span>
      </div>

      <div className="d-flex gap-2 overflow-auto no-scrollbar">
        {users.map((user, i) => (
          <Link
            key={user._id}
            to={`/live/${user._id}`}
            style={{ textDecoration: "none", color: "inherit", minWidth: 70 }}
          >
            <div className="text-center">

              <div className="position-relative">
                <img
                  src={user.profileImage}
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
                  style={{ width: 9, height: 9 }}
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