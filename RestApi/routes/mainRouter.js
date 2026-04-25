const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");
const menu = require("../controllers/menuController");
// const authMiddleware = require("../middleware/authMiddleware");
const { protect } = require("../middleware/authMiddleware");
const upload  = require("../middleware/upload");

const mux = require("../config/mux");

router.post("/register", upload.single("profileImage"), controller.register);
router.post("/agentregister", upload.single("profileImage"), controller.agentregister);
router.post("/login", controller.login);
router.delete("/deleteuser/:id", controller.deleteUser);
router.get("/updateuserstatus/:id/:status", controller.updatestatus);

router.post("/go-live", protect, controller.toggleLiveStatus);
router.get("/get_live_status", protect, controller.getLiveStatus);

router.get("/users", controller.getUsers);
router.get("/liveusers", controller.getLiveUsers);
router.get("/user/:id", controller.getUserDetail);
router.delete("/users/:id", controller.deleteUser);
router.post("/updatetoken", protect, controller.setDailyLimit);

router.post("/add-tip", menu.addtip);
router.get("/tip/:user_id", menu.getTipsByUser);
router.post("/submit-token", menu.submitToken);
router.get("/token/:myid", menu.getSubmittedTokens);
router.post("/privateshowrequest", menu.submitPrivateRequest);
router.post("/set-private-show", protect, controller.setPrivateShow);
router.get("/creator-private-requests/:my_id", menu.getPrivateRequestsByCreator);
router.get("/user-private-requests/:my_id", menu.getPrivateRequestsByUser);
router.get("/private-requests/:id", menu.getPrivateRequest);
router.put("/start-private-show/:id", menu.startPrivateShow);
router.put("/complete-private-show/:id", menu.completePrivateShow);

router.get("/admin-private-requests", menu.getPrivateRequestsByAdmin);

router.post("/create-order", controller.createRazorpayOrder);
router.post("/verify-payment", controller.verifyPayment);

// admin
router.get("/alluser/:role", controller.allactiveuser);
router.get("/tiptransection", menu.getTipTransection);
router.get("/rechargehistory", menu.getRechargeHistory);
router.post("/withdrawal", menu.withdrawalRequest);
router.get("/withdrawal-history/:user_id", menu.getWithdrawalHistory);
router.get("/admin-withdrawal-history", menu.getAdminWithdrawalHistory);
router.put("/update-withdrawal/:id/:status", menu.updateWithdrawalStatus);
router.get("/admindashboard", menu.admindashboard);
router.post("/settings/save", menu.saveSetting);
router.get("/settings/get", menu.getSetting);

// Agent
router.get("/agentuser/:role/:agent_id", controller.allagentactiveuser);
router.get("/agentliveuser/:role/:agent_id", controller.allagentliveactiveuser);


let activeStream = null;

// 🎥 Create Live Stream
router.post("/start-live", async (req, res) => {
  try {
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
    });

    activeStream = liveStream;

    res.json({
      streamKey: liveStream.stream_key,
      playbackId: liveStream.playback_ids[0].id,
      rtmpUrl: "rtmp://live.mux.com/app",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👀 Get Active Live Playback
router.get("/live-status", (req, res) => {
  if (!activeStream) {
    return res.json({ live: false });
  }

  res.json({
    live: true,
    playbackId: activeStream.playback_ids[0].id,
  });
});



module.exports = router;
