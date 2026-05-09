import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import ENDPOINTS from "../api/endpoints";
import { updateMembership } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const perks = [
  {
    icon: "💌",
    title: "Unlimited Private Messages",
    desc: "Send unlimited private messages directly to creators.",
  },
  {
    icon: "🔥",
    title: "Model Stream Preview",
    desc: "Preview creator streams before joining premium rooms.",
  },
  {
    icon: "🕵️",
    title: "Invisible Mode",
    desc: "Browse streams privately without showing online status.",
  },
  {
    icon: "🎁",
    title: "Exclusive Seasonal Offers",
    desc: "Unlock special rewards, bonus tokens & offers.",
  },
  {
    icon: "🥵",
    title: "Spicy Emoji",
    desc: "Use exclusive premium emoji during live chats.",
  },
  {
    icon: "🪙",
    title: "Anonymous Tips",
    desc: "Send private tips anonymously during streams.",
  },
  {
    icon: "⭐",
    title: "Badge In Chat",
    desc: "Show your Ultimate badge during live streaming.",
  },
  {
    icon: "📞",
    title: "24/7 Support",
    desc: "Get instant premium support whenever you need.",
  },
];

const compareData = [
  ["Private Chat", "✖", "✔", "✔"],
  ["Private Calls", "✖", "✔", "✔"],
  ["Model Preview", "✖", "✖", "✔"],
  ["Invisible Mode", "✖", "✖", "✔"],
  ["Seasonal Offers", "✖", "✖", "✔"],
  ["Spicy Emoji", "✖", "✖", "✔"],
  ["Anonymous Tips", "✖", "✖", "✔"],
  ["Badge In Chat", "✖", "✖", "✔"],
  ["24/7 Support", "✖", "✖", "✔"],
];

const plans = [
  {
    id: 1,
    name: "Monthly Plan",
    plan_type: "monthly",
    price: 499,
    duration: "/ Month",
    badge: "MOST POPULAR",
    features: [
      "Unlimited Private Chats",
      "VIP Creator Access",
      "Invisible Browsing",
      "Exclusive Emoji",
      "24/7 Support",
    ],
  },
  {
    id: 2,
    name: "Yearly Plan",
    plan_type: "yearly",
    price: 3999,
    duration: "/ Year",
    badge: "BEST VALUE",
    features: [
      "Everything in Monthly",
      "Priority Creator Calls",
      "Special Rewards",
      "Anonymous Tips",
      "Premium Badge",
    ],
  },
];

const Ultimate = () => {
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [successPopup, setSuccessPopup] =
    useState(false);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);


  const [upgradeAmount, setUpgradeAmount] =
  useState(0);

const now = new Date();

const membershipActiveDate = user?.membershipActiveDate
  ? new Date(user.membershipActiveDate)
  : null;

const membershipEndDate = user?.membershipEndDate
  ? new Date(user.membershipEndDate)
  : null;

// 🔥 TOTAL DAYS
const totalDays =
  membershipActiveDate && membershipEndDate
    ? Math.ceil(
        (membershipEndDate - membershipActiveDate) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

// 🔥 REMAINING DAYS
const remainingDays =
  membershipEndDate
    ? Math.max(
        0,
        Math.ceil(
          (membershipEndDate - now) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  useEffect(() => {

  // 🔥 YEARLY ACTIVE => REDIRECT HOME
  if (
    user?.membershipStatus === 1 &&
    user?.membershipType === "yearly" &&
    membershipEndDate > now
  ) {
    navigate("/");
  }

  // 🔥 MONTHLY ACTIVE => CALCULATE UPGRADE PRICE
  if (
    user?.membershipStatus === 1 &&
    user?.membershipType === "monthly" &&
    membershipEndDate > now
  ) {

    const monthlyPrice = 499;

    const yearlyPrice = 3999;

    // 🔥 DAILY VALUE
    const dailyValue =
      monthlyPrice / totalDays;

    // 🔥 REMAINING VALUE
    const remainingValue =
      dailyValue * remainingDays;

    // 🔥 FINAL YEARLY PRICE
    const finalAmount = Math.max(
      0,
      Math.round(yearlyPrice - remainingValue)
    );

    setUpgradeAmount(finalAmount);
  }

}, []);  


  // 🔥 LOAD RAZORPAY
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.id = "razorpay-script";

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // 🔥 PAYMENT FUNCTION
  const handlePlanPurchase = async (plan) => {

    setLoading(true);

    const scriptLoaded = await loadRazorpayScript();

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
          name: user?.name,
          email: user?.email,
          phone: "7987256303",
          amount:
            user?.membershipStatus === 1 &&
            user?.membershipType === "monthly" &&
            plan.plan_type === "yearly" &&
            membershipEndDate > now
              ? upgradeAmount
              : plan.price,
          plan_type: plan.plan_type,
        }
      );

      const { order, key } = res.data;

      // 🔥 RAZORPAY OPTIONS
      const options = {

        key: key,

        amount: order.amount,

        currency: order.currency,

        name: "Ultimate Membership",

        description: plan.name,

        order_id: order.id,

        handler: async function (response) {

          try {

            // 🔥 VERIFY PAYMENT
            const verifyRes = await axiosInstance.post(
              ENDPOINTS.VERIFY_MEMBERSHIP_PAYMENT,
              {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                amount: plan.price,

                user_id: user?._id,

                membership: plan.name,

                // 🔥 NEW PLAN TYPE
                plan_type: plan.plan_type,
              }
            );

            dispatch(
              updateMembership({
                membershipStatus: 1,

                membershipType: plan.plan_type,

                membershipActiveDate:
                  verifyRes.data.membershipActiveDate,

                membershipEndDate:
                  verifyRes.data.membershipEndDate,
              })
            );

            setSuccessPopup(true);

              // 🔥 AUTO REDIRECT AFTER 5 SEC
              setTimeout(() => {
                navigate("/");
              }, 5000);

          } catch (error) {

            console.log(error);

            alert("Payment verification failed");

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

      const rzp = new window.Razorpay(options);

      rzp.open();

    } catch (error) {

      console.log(error);

      alert("Payment Failed");

    }

    setLoading(false);

  };

  return (
    <>
      <Header />
      
      <div style={styles.page}>
        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay}>
            <div style={styles.heroContent}>
              <div style={styles.topBadge}>
                🔥 GO ULTIMATE
              </div>

              <h1 style={styles.heroTitle}>
                Unlock Premium <br />
                Adult Features 🚀
              </h1>

              <p style={styles.heroText}>
                Upgrade your account and enjoy VIP creator
                tools, private streaming benefits,
                audience boosts & premium live
                experience.
              </p>

              <div style={styles.heroButtons}>
                <Link
                  to="/creator"
                  style={styles.secondaryBtn}
                >
                  Explore Creators
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PLANS */}
        <section style={styles.planSection}>
          <h2 style={styles.heading}>
            Choose Your{" "}
            <span style={{ color: "#ff5a00" }}>
              Ultimate
            </span>{" "}
            Plan
          </h2>

          <div style={styles.planGrid}>
            {plans.map((plan) => (
              <div key={plan.id} style={styles.planCard}>
                <div style={styles.planBadge}>
                  {plan.badge}
                </div>

                <h3 style={styles.planTitle}>
                  {plan.name}
                </h3>

                <div style={styles.priceWrap}>
                  <span style={styles.price}>
                    ₹{plan.price}
                  </span>

                  <span style={styles.duration}>
                    {plan.duration}
                  </span>
                </div>

                <div style={styles.featureList}>
                  {plan.features.map(
                    (feature, i) => (
                      <div
                        key={i}
                        style={styles.featureItem}
                      >
                        ✅ {feature}
                      </div>
                    )
                  )}
                </div>

                <button
                  style={styles.planBtn}
                  onClick={() =>
                    handlePlanPurchase(plan)
                  }
                  disabled={
                            loading ||
                            (
                              user?.membershipStatus === 1 &&
                              user?.membershipType === "monthly" &&
                              plan.plan_type === "monthly" &&
                              membershipEndDate > now
                            )
                          }
                >
                  {loading
                    ? "Processing..."
                    : user?.membershipStatus === 1 &&
                      user?.membershipType === "monthly" &&
                      plan.plan_type === "monthly" &&
                      membershipEndDate > now
                    ? "Already Active"
                    : user?.membershipStatus === 1 &&
                      user?.membershipType === "monthly" &&
                      plan.plan_type === "yearly" &&
                      membershipEndDate > now
                    ? `Upgrade ₹${upgradeAmount}`
                    : `Buy ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PERKS */}
        <section style={styles.section}>
          <h2 style={styles.heading}>
            Ultimate Membership Perks
          </h2>

          <div style={styles.grid}>
            {perks.map((item, index) => (
              <div key={index} style={styles.card}>
                <div style={styles.iconWrap}>
                  <span style={styles.icon}>
                    {item.icon}
                  </span>
                </div>

                <h3 style={styles.cardTitle}>
                  {item.title}
                </h3>

                <p style={styles.cardDesc}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* TABLE */}
        <section style={styles.compareSection}>
          <h2 style={styles.compareHeading}>
            Membership Comparison
          </h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th></th>

                  <th style={{ textAlign: "center" }}>
                    GUEST
                  </th>

                  <th style={{ textAlign: "center" }}>
                    REGISTERED
                  </th>

                  <th
                    style={{
                      textAlign: "center",
                      color: "#ff5a00",
                    }}
                  >
                    ULTIMATE
                  </th>
                </tr>
              </thead>

              <tbody>
                {compareData.map((row, index) => (
                  <tr key={index}>
                    <td style={styles.featureName}>
                      {row[0]}
                    </td>

                    <td style={styles.cross}>
                      {row[1]}
                    </td>

                    <td style={styles.normal}>
                      {row[2]}
                    </td>

                    <td style={styles.ultimate}>
                      {row[3]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* SUCCESS POPUP */}
        {successPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupBox}>
              <div style={styles.popupIcon}>🎉</div>

              <h2 style={styles.popupTitle}>
                Membership Activated
              </h2>

              <p style={styles.popupText}>
                Your Ultimate Membership is now active 🔥
              </p>

              <p style={styles.popupRedirect}>
                Redirecting to home page in 5 seconds...
              </p>

              <button
                style={styles.popupBtn}
                onClick={() => navigate("/")}
              >
                Go To Home
              </button>
            </div>
          </div>
        )}

      <Footer />
    </>
  );
};

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight: "100vh",
  },

  hero: {
    minHeight: "85vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  heroOverlay: {
    minHeight: "85vh",
    background:
      "linear-gradient(rgba(0,0,0,.78), rgba(0,0,0,.72))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "50px 20px",
  },

  heroContent: {
    textAlign: "center",
    maxWidth: "900px",
    color: "#fff",
  },

  topBadge: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg,#ff0050,#ff9f00)",
    fontWeight: "700",
    marginBottom: "25px",
  },

  heroTitle: {
    fontSize: "clamp(40px,8vw,72px)",
    fontWeight: "900",
    lineHeight: "1.1",
  },

  heroText: {
    fontSize: "18px",
    color: "rgba(255,255,255,.82)",
    lineHeight: "1.9",
    marginTop: "20px",
  },

  heroButtons: {
    marginTop: "35px",
  },

  secondaryBtn: {
    padding: "16px 35px",
    borderRadius: "999px",
    background: "#fff",
    color: "#111",
    textDecoration: "none",
    fontWeight: "700",
  },

  planSection: {
    maxWidth: "1200px",
    margin: "80px auto",
    padding: "0 15px",
  },

  heading: {
    textAlign: "center",
    fontSize: "clamp(30px,5vw,45px)",
    fontWeight: "800",
    marginBottom: "50px",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: "30px",
  },

  planCard: {
    background: "#fff",
    borderRadius: "30px",
    padding: "40px 30px",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 15px 40px rgba(0,0,0,.08)",
  },

  planBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    background:
      "linear-gradient(90deg,#ff0050,#ff9f00)",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },

  planTitle: {
    fontSize: "30px",
    fontWeight: "800",
    marginTop: "20px",
  },

  priceWrap: {
    marginTop: "25px",
    marginBottom: "25px",
  },

  price: {
    fontSize: "58px",
    fontWeight: "900",
    color: "#111",
  },

  duration: {
    fontSize: "18px",
    color: "#777",
  },

  featureList: {
    textAlign: "left",
    marginBottom: "30px",
  },

  featureItem: {
    padding: "12px 0",
    borderBottom: "1px solid #eee",
    fontSize: "15px",
    color: "#444",
  },

  planBtn: {
    width: "100%",
    padding: "17px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(90deg,#ff0050,#ff9f00)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "17px",
    cursor: "pointer",
  },

  section: {
    maxWidth: "1200px",
    margin: "80px auto",
    padding: "0 15px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "25px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,.06)",
  },

  iconWrap: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#ff0050,#ff9f00)",
  },

  icon: {
    fontSize: "35px",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "10px",
  },

  cardDesc: {
    color: "#666",
    lineHeight: "1.8",
  },

  compareSection: {
    maxWidth: "1200px",
    margin: "80px auto",
    padding: "0 15px 80px",
  },

  compareHeading: {
    textAlign: "center",
    fontSize: "40px",
    fontWeight: "800",
    marginBottom: "40px",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "25px",
    padding: "20px",
    boxShadow: "0 12px 35px rgba(0,0,0,.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  featureName: {
    padding: "18px",
    fontWeight: "600",
  },

  cross: {
    textAlign: "center",
    padding: "18px",
    color: "red",
    fontWeight: "700",
  },

  normal: {
    textAlign: "center",
    padding: "18px",
    fontWeight: "700",
  },

  ultimate: {
    textAlign: "center",
    padding: "18px",
    color: "green",
    fontWeight: "700",
  },

  popupOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
},

popupBox: {
  width: "100%",
  maxWidth: "420px",
  background: "#fff",
  borderRadius: "30px",
  padding: "45px 30px",
  textAlign: "center",
  animation: "popupScale 0.3s ease",
  boxShadow: "0 20px 60px rgba(0,0,0,.3)",
},

popupIcon: {
  fontSize: "70px",
  marginBottom: "20px",
},

popupTitle: {
  fontSize: "32px",
  fontWeight: "800",
  marginBottom: "12px",
  color: "#111",
},

popupText: {
  fontSize: "17px",
  color: "#555",
  lineHeight: "1.8",
},

popupRedirect: {
  marginTop: "15px",
  color: "#ff5a00",
  fontWeight: "700",
},

popupBtn: {
  marginTop: "30px",
  border: "none",
  padding: "15px 30px",
  borderRadius: "14px",
  background:
    "linear-gradient(90deg,#ff0050,#ff9f00)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "16px",
},

};

export default Ultimate;