import React, { useState } from "react";

export default function Offline() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);

    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setRetrying(false);
      }
    }, 1500);
  };

  return (
    <div className="offline-container">
      {/* BACKGROUND GLOW */}
      <div className="bg-glow"></div>

      <div className="card">
        {/* WIFI ICON */}
        <div className="wifi-icon">
          📡
        </div>

        <h2>You're Offline</h2>

        <p>
          Connection lost. Please check your internet and try again.
        </p>

        {/* LOADING DOTS */}
        <div className="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* BUTTON */}
        <button onClick={handleRetry} disabled={retrying}>
          {retrying ? "Reconnecting..." : "Try Again"}
        </button>
      </div>

      {/* STYLES */}
      <style>{`
        .offline-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at top, #0f172a, #020617);
          overflow: hidden;
          font-family: sans-serif;
        }

        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #ec4899, transparent 70%);
          filter: blur(120px);
          animation: glowMove 6s infinite alternate;
        }

        @keyframes glowMove {
          from { transform: translate(-100px, -100px); }
          to { transform: translate(100px, 100px); }
        }

        .card {
          position: relative;
          z-index: 2;
          backdrop-filter: blur(25px);
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          color: white;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 80px rgba(0,0,0,0.6);
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }

        .wifi-icon {
          font-size: 70px;
          margin-bottom: 10px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.7; }
        }

        h2 {
          margin-bottom: 10px;
        }

        p {
          font-size: 14px;
          opacity: 0.7;
        }

        .dots {
          margin: 20px 0;
        }

        .dots span {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 5px;
          background: #ec4899;
          border-radius: 50%;
          animation: bounce 1.4s infinite;
        }

        .dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        button {
          padding: 12px 30px;
          border-radius: 30px;
          border: none;
          background: linear-gradient(135deg,#ec4899,#db2777);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px #ec4899;
        }

        button:disabled {
          background: #64748b;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}