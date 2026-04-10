import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreatorSidebar from "../components/CreatorSidebar";
import { useSelector, useDispatch } from "react-redux";
import { updateShow, getLiveStatus } from "../redux/slices/authSlice";

export default function PrivateMenu() {

  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [privateShowAmount, setprivateShowAmount] = useState("");
  const [exclusiveAmount, setExclusiveAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH DATA =================

  const fetchMyData = async () => {
    try {

      const response = await dispatch(
        getLiveStatus({ token })
      );

      if (!response.payload?.success) return;

      const userData = response.payload.user;

      setprivateShowAmount(
        userData?.privateShowAmount || ""
      );

      setExclusiveAmount(
        userData?.exclusiveShowAmount || ""
      );

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyData();
    }
  }, [token]);

  // ================= SAVE SETTING =================

  const saveSetting = async () => {

    try {

      if (!privateShowAmount || !exclusiveAmount) {
        alert("Enter all fields");
        return;
      }

      setLoading(true);

      const resultAction = await dispatch(
        updateShow({
          privateShowAmount,
          exclusiveShowAmount: exclusiveAmount
        })
      );

      if (updateShow.fulfilled.match(resultAction)) {

        alert(
          resultAction.payload.message ||
          "Private show settings updated successfully"
        );

        fetchMyData(); // refresh values

      } else {

        alert(resultAction.payload || "Failed to update");

      }

      setLoading(false);

    } catch (error) {

      console.log(error);
      setLoading(false);

    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <CreatorSidebar />

        <div className="col-md-10 p-4 bg-light">

          <h3 className="fw-bold mb-4">
            🔒 Private Show Settings
          </h3>

          <div className="card shadow rounded-4 border-0">

            <div className="card-body">

              <div className="row">

                {/* Private Show */}
                <div className="col-md-6">

                  <div className="card border-primary rounded-4 mb-3">
                    <div className="card-body">

                      <h5 className="fw-bold text-primary">
                        💬 Private Show
                      </h5>

                      <p className="text-muted">
                        Token per minute
                      </p>

                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter token"
                        value={privateShowAmount}
                        onChange={(e) =>
                          setprivateShowAmount(
                            e.target.value
                          )
                        }
                      />

                    </div>
                  </div>

                </div>

                {/* Exclusive Show */}
                <div className="col-md-6">

                  <div className="card border-danger rounded-4 mb-3">
                    <div className="card-body">

                      <h5 className="fw-bold text-danger">
                        🔥 Exclusive Private Show
                      </h5>

                      <p className="text-muted">
                        Token per minute
                      </p>

                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter token"
                        value={exclusiveAmount}
                        onChange={(e) =>
                          setExclusiveAmount(
                            e.target.value
                          )
                        }
                      />

                    </div>
                  </div>

                </div>

              </div>

              <div className="text-center mt-3">

                <button
                  className="btn btn-dark px-4"
                  onClick={saveSetting}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Setting"}
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}