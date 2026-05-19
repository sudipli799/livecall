import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";
import { updateWallet } from "../redux/slices/authSlice";

const rechargePlans = [
  50,
  100,
  200,
  500
];

const WalletRecharge = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [amount, setAmount] = useState(500);

  const [loading, setLoading] = useState(false);

  const [successPopup, setSuccessPopup] =
    useState(false);

  // 🔥 LOAD RAZORPAY
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (
        document.getElementById(
          "razorpay-script"
        )
      ) {
        resolve(true);
        return;
      }

      const script = document.createElement(
        "script"
      );

      script.id = "razorpay-script";

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // 🔥 HANDLE PAYMENT
  const handleRecharge = async () => {

    if (!amount || amount < 1) {
      alert("Minimum recharge 1 token");
      return;
    }

    if (amount > 500) {
      alert("Maximum recharge limit is 500 tokens");
      return;
    }

    setLoading(true);

    // 🔥 Razorpay script load
    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      alert("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }

    try {

      // 🔥 CREATE ORDER
      const res = await axiosInstance.post(
        ENDPOINTS.CREATE_RAZORPAY_ORDER,
        {
          user_id: user?._id,
          email: user?.email,
          phone: "7987256303",
          name: user?.name,
          amount: amount,
        }
      );

      const { order, key } = res.data;

      const options = {
        key: key,

        amount: order.amount,

        currency: order.currency,

        name: "Live App Wallet",

        description: "Wallet Recharge",

        order_id: order.id,

        handler: async function (response) {

          try {

            // 🔥 VERIFY PAYMENT
            const verifyRes =
              await axiosInstance.post(
                ENDPOINTS.VERIFY_PAYMENT,
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  amount: amount,

                  user_id: user?._id,
                }
              );

            // 🔥 UPDATE WALLET
            dispatch(
              updateWallet(
                verifyRes.data.wallet
              )
            );

            // 🔥 SUCCESS POPUP
            setSuccessPopup(true);

            setTimeout(() => {
              setSuccessPopup(false);
            }, 4000);

          } catch (error) {

            console.log(error);

            alert(
              "Payment verification failed"
            );

          }

        },

        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },

        theme: {
          color: "#ff5a00",
        },
      };

      const rzp = new window.Razorpay(
        options
      );

      rzp.open();

    } catch (error) {

      console.log(error);

      alert("Payment failed");

    }

    setLoading(false);

  };

  return (
    <>
      <Header />

      <div style={styles.page}>
        <div style={styles.blur1}></div>
        <div style={styles.blur2}></div>

        <div style={styles.heroSection}>
          <div style={styles.heroCard}>
            {/* TOP */}
            <div style={styles.walletIcon}>
              💰
            </div>

            <h1 style={styles.title}>
              Recharge Wallet
            </h1>

            <p style={styles.subtitle}>
              Add tokens instantly and enjoy premium
              features.
            </p>

            {/* BALANCE */}
            <div style={styles.balanceBox}>
              <div style={styles.balanceLabel}>
                Available Tokens
              </div>

              <div style={styles.balanceAmount}>
                🪙 {user?.wallet || 0}
              </div>
            </div>

            {/* QUICK PLANS */}
            <div style={styles.quickWrap}>
              {rechargePlans.map((item, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.quickBtn,
                    background:
                      amount === item
                        ? "linear-gradient(90deg,#ff0050,#ff9f00)"
                        : "#fff",
                    color:
                      amount === item
                        ? "#fff"
                        : "#111",
                    transform:
                      amount === item
                        ? "scale(1.03)"
                        : "scale(1)",
                  }}
                  onClick={() =>
                    setAmount(item)
                  }
                >
                  🪙 {item}
                </button>
              ))}
            </div>

            {/* INPUT */}
            <div style={styles.inputWrap}>
              <input
                type="number"
                placeholder="Enter Tokens"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    Number(e.target.value)
                  )
                }
                style={styles.input}
              />
            </div>

            {/* BTN */}
            <button
              style={styles.rechargeBtn}
              onClick={handleRecharge}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : `Recharge 🪙 ${amount}`}
            </button>

            {/* SAFE */}
            <div style={styles.secureText}>
              🔒 100% Secure Payment via Razorpay
            </div>
          </div>
        </div>

        {/* SUCCESS POPUP */}
        {successPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupBox}>
              <div style={styles.successCircle}>
                ✓
              </div>

              <h2 style={styles.popupTitle}>
                Recharge Successful
              </h2>

              <p style={styles.popupText}>
                🪙 {amount} added successfully
                to your wallet.
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#fff5f7,#fff8f0)",
    padding: "40px 15px",
    position: "relative",
    overflow: "hidden",
  },

  blur1: {
    position: "absolute",
    width: "250px",
    height: "250px",
    background: "#ff0050",
    filter: "blur(140px)",
    opacity: 0.12,
    top: "-50px",
    left: "-50px",
  },

  blur2: {
    position: "absolute",
    width: "250px",
    height: "250px",
    background: "#ff9f00",
    filter: "blur(140px)",
    opacity: 0.12,
    bottom: "-50px",
    right: "-50px",
  },

  heroSection: {
    maxWidth: "520px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  heroCard: {
    background: "rgba(255,255,255,.92)",
    backdropFilter: "blur(12px)",
    borderRadius: "28px",
    padding: "35px 25px",
    boxShadow: "0 15px 45px rgba(0,0,0,.08)",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,.5)",
  },

  walletIcon: {
    width: "80px",
    height: "80px",
    margin: "0 auto 18px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#ff0050,#ff9f00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    boxShadow: "0 10px 25px rgba(255,0,80,.3)",
  },

  title: {
    fontSize: "30px",
    fontWeight: "900",
    marginBottom: "8px",
    color: "#111",
  },

  subtitle: {
    color: "#666",
    lineHeight: "1.7",
    marginBottom: "25px",
    fontSize: "14px",
  },

  balanceBox: {
    background:
      "linear-gradient(135deg,#111,#222)",
    color: "#fff",
    borderRadius: "22px",
    padding: "22px",
    marginBottom: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,.15)",
  },

  balanceLabel: {
    fontSize: "13px",
    opacity: 0.75,
    letterSpacing: "1px",
  },

  balanceAmount: {
    fontSize: "34px",
    fontWeight: "900",
    marginTop: "8px",
  },

  quickWrap: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(100px,1fr))",
    gap: "12px",
    marginBottom: "22px",
  },

  quickBtn: {
    border: "2px solid #eee",
    padding: "13px",
    borderRadius: "15px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.25s",
  },

  inputWrap: {
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    border: "2px solid #eee",
    outline: "none",
    fontSize: "15px",
    fontWeight: "700",
    background: "#fff",
  },

  rechargeBtn: {
    width: "100%",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    background:
      "linear-gradient(90deg,#ff0050,#ff9f00)",
    color: "#fff",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(255,90,0,.25)",
  },

  secureText: {
    marginTop: "18px",
    color: "#666",
    fontSize: "12px",
    fontWeight: "600",
  },

  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "15px",
  },

  popupBox: {
    background: "#fff",
    borderRadius: "28px",
    padding: "35px 25px",
    textAlign: "center",
    width: "100%",
    maxWidth: "360px",
    animation: "popupScale .3s ease",
  },

  successCircle: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#00c853,#64dd17)",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "36px",
    fontWeight: "900",
  },

  popupTitle: {
    fontSize: "26px",
    fontWeight: "900",
    marginBottom: "10px",
    color: "#111",
  },

  popupText: {
    color: "#555",
    fontSize: "14px",
    lineHeight: "1.7",
  },
};

export default WalletRecharge;