const { RtcTokenBuilder, RtcRole } = require("agora-token");
const { Menu, MyTip, PrivateShow, Wallet, Withdrawal, Setting, VipAccess, BankAccount  } = require("../models/TipModel");
const User = require("../models/MainModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");




// SAVE OR UPDATE (UPSERT)
exports.saveSetting = async (req, res) => {
  try {
    const data = req.body;

    // 🔥 UPSERT (create if not exist, update if exist)
    const setting = await Setting.findOneAndUpdate(
      {},          // empty filter = single global document
      data,
      {
        new: true,
        upsert: true,   // create if not exists
      }
    );

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: setting,
    });

  } catch (error) {
    console.log("Save Setting Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne();

    return res.status(200).json({
      success: true,
      data: setting || {}, // if no record, return empty object
    });

  } catch (error) {
    console.log("Get Setting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/*
==============================
ADD TIP OR TOY
==============================
*/
exports.addtip = async (req, res) => {
  try {
    const { user_id, title, amount, tiptype } = req.body;

    if (!user_id || !title || !amount) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const menu = await Menu.create({
      title,
      user_id,
      amount,
      tiptype: tiptype || "Tip",
      addedDate: new Date(),
    });

    res.status(201).json({
      message: "Added Successfully",
      data: menu,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


/*
==============================
GET TIP BY USER
==============================
*/
exports.getTipsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const tips = await Menu.find({ user_id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tips fetched successfully",
      count: tips.length,
      data: tips,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


/*
==============================
SUBMIT TOKEN
==============================
*/
exports.submitToken = async (req, res) => {

  try {

    const {
      sender_id,
      token,
      type,
      msg,
      myid
    } = req.body;

    // ==========================
    // VALIDATION
    // ==========================
    if (
      !sender_id ||
      !token ||
      !msg ||
      !myid
    ) {

      return res.status(400).json({
        success: false,
        message: "All fields required",
      });

    }

    // ==========================
    // SENDER USER
    // ==========================
    const senderUser =
      await User.findById(sender_id);

    if (!senderUser) {

      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });

    }

    // ==========================
    // RECEIVER USER
    // ==========================
    const receiverUser =
      await User.findById(myid);

    if (!receiverUser) {

      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });

    }

    const amount = Number(token);

    // ==========================
    // WALLET CHECK
    // ==========================
    if (
      Number(senderUser.wallet || 0) < amount
    ) {

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });

    }

    // ==========================
    // AGENT CHECK
    // ==========================
    let agentUser = null;

    if (receiverUser.vendor_id) {

      agentUser = await User.findById(
        receiverUser.vendor_id
      );

    }

    /*
    ====================================
    COMMISSION CALCULATION
    ====================================
    */

    let adminCommission = 0;

    let agentCommission = 0;

    let creatorAmount = 0;

    // ====================================
    // NO AGENT
    // ADMIN = 65%
    // CREATOR = 35%
    // ====================================

    if (!agentUser) {

      adminCommission =
        Number((amount * 65) / 100);

      creatorAmount =
        Number((amount * 35) / 100);

    }

    // ====================================
    // AGENT EXISTS
    // AGENT = 50%
    // ADMIN = 15%
    // CREATOR = 35%
    // ====================================

    else {

      agentCommission =
        Number((amount * 50) / 100);

      adminCommission =
        Number((amount * 15) / 100);

      creatorAmount =
        Number((amount * 35) / 100);

    }

    // ==========================
    // CREATE TIP
    // ==========================
    const tip = await MyTip.create({

      sender_id,

      token: amount,

      type: type || "Tip",

      msg,

      myid,

      adminCommission,

      agentCommission,

      creatorAmount,

      date: new Date(),

    });

    /*
    ====================================
    WALLET UPDATE
    ====================================
    */

    // ==========================
    // SENDER WALLET MINUS
    // ==========================
    senderUser.wallet =
      Number(senderUser.wallet || 0) - amount;

    await senderUser.save();

    // ==========================
    // CREATOR WALLET ADD
    // ==========================
    receiverUser.wallet =
      Number(receiverUser.wallet || 0) +
      creatorAmount;

    // creator stats
    receiverUser.getdailyLimit =
      Number(receiverUser.getdailyLimit || 0) +
      amount;

    // admin commission track
    receiverUser.adminCommission =
      Number(receiverUser.adminCommission || 0) +
      adminCommission;

    await receiverUser.save();

    // ==========================
    // AGENT WALLET ADD
    // ==========================
    if (agentUser) {

      agentUser.wallet =
        Number(agentUser.wallet || 0) +
        agentCommission;

      agentUser.agentCommission =
        Number(agentUser.agentCommission || 0) +
        agentCommission;

      await agentUser.save();

    }

    // ==========================
    // SUCCESS RESPONSE
    // ==========================
    return res.status(201).json({

      success: true,

      message:
        "Token Submitted Successfully",

      data: tip,

      breakdown: {

        total: amount,

        adminCommission,

        agentCommission,

        creatorAmount,

      },

      senderWallet:
        senderUser.wallet,

      receiverWallet:
        receiverUser.wallet,

      agentWallet:
        agentUser?.wallet || 0,

    });

  }

  catch (error) {

    console.log(
      "SUBMIT TOKEN ERROR",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


exports.submitPrivateRequest = async (req, res) => {
  try {

    const { sender_id, token, type, myid } = req.body;

    if (!sender_id || !token || !myid) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // viewer
    const senderUser = await User.findById(sender_id);

    if (!senderUser) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    // creator
    const creatorUser = await User.findById(myid);

    if (!creatorUser) {
      return res.status(404).json({
        success: false,
        message: "Creator not found",
      });
    }

    // ✅ WALLET CHECK (NEW)
    if (Number(senderUser.wallet) < Number(token)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    /*
    ==========================
    AGORA CONFIG
    ==========================
    */

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res.status(500).json({
        success: false,
        message: "Agora credentials missing",
      });
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

    const channelName = `${myid}`;

    const viewerUid = Math.floor(Math.random() * 100000);
    const creatorUid = Math.floor(Math.random() * 100000);

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime =
      currentTimestamp + expirationTimeInSeconds;

    const viewerToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      viewerUid,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );

    const creatorToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      creatorUid,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );


    const adminUid = Math.floor(Math.random() * 100000);

    const adminToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      adminUid,
      RtcRole.SUBSCRIBER, // 🔥 important (admin sirf dekh raha hai)
      privilegeExpireTime
    );

    

    /*
    ==========================
    💰 WALLET UPDATE (NEW)
    ==========================
    */

    // sender wallet minus
    // senderUser.wallet =
    //   Number(senderUser.wallet) - Number(token);
    // await senderUser.save();

    // // creator earning increase
    // creatorUser.getdailyLimit =
    //   Number(creatorUser.getdailyLimit || 0) + Number(token);

    // await creatorUser.save();

    // ✅ ALSO SAVE IN TIP COLLECTION (NEW)
      // const tip = await MyTip.create({
      //   sender_id,
      //   token,
      //   type: type || "Private",
      //   msg: "Private show request",
      //   myid,
      //   date: new Date(),
      // });
    /*
    ==========================
    SAVE PRIVATE SHOW
    ==========================
    */

    const privateShow = await PrivateShow.create({
      sender_id,
      creator_id: myid,
      token,
      type: type || "Private",
      status: "Pending",
      channelName,
      viewerUid,
      creatorUid,
      adminUid,
      viewerToken,
      creatorToken,
      adminToken,
      showStartTime: null,
      showEndTime: null,
      duration: 0,
    });

    res.status(201).json({
      success: true,
      message: "Private show request sent",
      requestId: privateShow._id,
      data: privateShow,
      senderWallet: senderUser.wallet,              // ✅ optional
      creatorTodayToken: creatorUser.getdailyLimit, // ✅ optional
      agora: {
        appId,
        channelName,
        viewerUid,
        creatorUid,
        viewerToken,
        creatorToken,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getPrivateRequestsByAdmin = async (req, res) => {
  try {

    // 🔥 No filter → get all records
    const requests = await PrivateShow.find({})
      .populate("sender_id", "username name profileImage email")
      .populate("creator_id", "username name profileImage email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getPrivateRequestsByCreator = async (req, res) => {
  try {

    const { my_id } = req.params; // 👈 URL se lo (recommended)

    if (!my_id) {
      return res.status(400).json({
        success: false,
        message: "Creator ID is required",
      });
    }

    // 🔍 Find all private requests for creator
    const requests = await PrivateShow.find({
      creator_id: my_id
    })
    .populate("sender_id", "username name profileImage") // optional
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


exports.getPrivateRequestsByUser = async (req, res) => {
  try {

    const { my_id } = req.params;

    if (!my_id) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const requests = await PrivateShow.find({
      sender_id: my_id
    })
    .populate("creator_id", "username name profileImage wallet") // 🔥 creator detail
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPrivateRequest = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Request ID required",
      });
    }

    const request = await PrivateShow.findById(id)
      .populate("creator_id", "username name profileImage wallet")
      .populate("sender_id", "username name profileImage wallet");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.startPrivateShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Private show ID required",
      });
    }

    // 🔍 Find Private Show
    const privateShow = await PrivateShow.findById(id);

    if (!privateShow) {
      return res.status(404).json({
        success: false,
        message: "Private show not found",
      });
    }

    // ✅ Already started check
    if (privateShow.status === "Started") {
      return res.status(400).json({
        success: false,
        message: "Show already started",
      });
    }

    // ✅ UPDATE ONLY REQUIRED FIELDS
    privateShow.status = "Started";
    privateShow.showStartTime = new Date();

    await privateShow.save();

    return res.status(200).json({
      success: true,
      message: "Private show started",
      data: privateShow,
    });

  } catch (error) {
    console.log("Start Private Show Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.completePrivateShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Private show ID required",
      });
    }

    // 🔍 Find Show
    const privateShow = await PrivateShow.findById(id);

    if (!privateShow) {
      return res.status(404).json({
        success: false,
        message: "Private show not found",
      });
    }

    // ❌ Already completed check
    if (privateShow.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Show already completed",
      });
    }

    if (!privateShow.showStartTime) {
      return res.status(400).json({
        success: false,
        message: "Show not started yet",
      });
    }

    // 👤 Users
    const senderUser = await User.findById(
      privateShow.sender_id
    );

    const creatorUser = await User.findById(
      privateShow.creator_id
    );

    if (!senderUser || !creatorUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    ==========================
    🏢 AGENT / VENDOR CHECK
    ==========================
    */

    let agentUser = null;

    if (creatorUser.vendor_id) {
      agentUser = await User.findById(
        creatorUser.vendor_id
      );
    }

    /*
    ==========================
    ⏱️ TIME CALCULATION
    ==========================
    */

    const startTime = new Date(
      privateShow.showStartTime
    ).getTime();

    const endTime = Date.now();

    const durationSeconds = Math.floor(
      (endTime - startTime) / 1000
    );

    // ✅ CEIL USE
    const durationMinutes = Math.ceil(
      durationSeconds / 60
    );

    /*
    ==========================
    💰 TOKEN CALCULATION
    ==========================
    */

    const tokenPerMin = Number(
      privateShow.token || 0
    );

    const totalAmount =
      durationMinutes * tokenPerMin;

    /*
    ==========================
    💸 WALLET CHECK
    ==========================
    */

    if (
      Number(senderUser.wallet) < totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User has insufficient balance for final deduction",
      });
    }

    /*
    ==========================
    💰 COMMISSION LOGIC
    ==========================
    */

    let creatorShare = 0;

    let adminCommission = 0;

    let agentCommission = 0;

    // ✅ AGENT EXISTS
    if (agentUser) {

      creatorShare = Math.ceil(
        (totalAmount * 35) / 100
      );

      agentCommission = Math.ceil(
        (totalAmount * 50) / 100
      );

      adminCommission = Math.ceil(
        (totalAmount * 15) / 100
      );

    } else {

      // ✅ NO AGENT

      agentCommission = 0;

      creatorShare = Math.ceil(
        (totalAmount * 35) / 100
      );

      adminCommission = Math.ceil(
        (totalAmount * 65) / 100
      );
    }

    /*
    ==========================
    💸 WALLET UPDATE
    ==========================
    */

    // sender deduct
    senderUser.wallet =
      Number(senderUser.wallet) - totalAmount;

    await senderUser.save();

    // creator wallet
    creatorUser.wallet =
      Number(creatorUser.wallet || 0) +
      creatorShare;

    // creator stats
    creatorUser.getdailyLimit =
      Number(
        creatorUser.getdailyLimit || 0
      ) + totalAmount;

    // admin commission store
    creatorUser.adminCommission =
      Number(
        creatorUser.adminCommission || 0
      ) + adminCommission;

    creatorUser.agentCommission =
      Number(
        creatorUser.agentCommission || 0
      ) + agentCommission;

    await creatorUser.save();

    /*
    ==========================
    🏢 AGENT WALLET UPDATE
    ==========================
    */

    if (agentUser) {

      agentUser.wallet =
        Number(agentUser.wallet || 0) +
        agentCommission;

      await agentUser.save();
    }

    /*
    ==========================
    📝 UPDATE PRIVATE SHOW
    ==========================
    */

    privateShow.status = "Completed";

    privateShow.showEndTime =
      new Date();

    privateShow.duration =
      durationSeconds;

    privateShow.totalAmount =
      totalAmount;

    privateShow.creatorShare =
      creatorShare;

    privateShow.adminCommission =
      adminCommission;

    privateShow.agentCommission =
      agentCommission;

    await privateShow.save();

    /*
    ==========================
    🧾 TIP ENTRY
    ==========================
    */

    const tip = await MyTip.create({
      sender_id: privateShow.sender_id,

      token: totalAmount,

      type: "Private",

      msg: "Private Show",

      myid: privateShow.creator_id,

      adminCommission,

      creatorAmount: creatorShare,

      agentCommission,

      agent_id: agentUser?._id || null,

      date: new Date(),
    });

    /*
    ==========================
    🔴 AGORA CLEANUP
    ==========================
    */

    console.log("Agora cleanup:", {
      channel: privateShow.channelName,
      viewerUid: privateShow.viewerUid,
      creatorUid: privateShow.creatorUid,
    });

    return res.status(200).json({
      success: true,
      message:
        "Private show completed successfully",

      data: privateShow,

      summary: {
        durationSeconds,
        durationMinutes,
        totalAmount,
        creatorShare,
        adminCommission,
        agentCommission,
        senderWallet: senderUser.wallet,
        creatorWallet: creatorUser.wallet,
        agentWallet: agentUser?.wallet || 0,
      },
    });

  } catch (error) {

    console.log(
      "Complete Private Show Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSubmittedTokens = async (req, res) => {
    try {

      const { myid } = req.params;

      const data = await MyTip.aggregate([

        {
          $match: {
            myid: myid
          }
        },

        {
          $lookup: {
            from: "users",
            let: { senderId: "$sender_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$_id",
                      {
                        $convert: {
                          input: "$$senderId",
                          to: "objectId",
                          onError: null,
                          onNull: null
                        }
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  name: 1
                }
              }
            ],
            as: "sender"
          }
        },

        {
          $unwind: {
            path: "$sender",
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $addFields: {
            sender_name: "$sender.name"
          }
        },

        {
          $project: {
            sender: 0
          }
        },

        {
          $sort: {
            date: -1
          }
        }

      ]);

      res.status(200).json({
        success: true,
        data
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message
      });

    }
};

exports.getTipTransection = async (req, res) => {
  try {

    const data = await MyTip.aggregate([

      // ❌ REMOVE FILTER (no $match)

      // ✅ SENDER JOIN
      {
        $lookup: {
          from: "users",
          let: { senderId: "$sender_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $convert: {
                        input: "$$senderId",
                        to: "objectId",
                        onError: null,
                        onNull: null
                      }
                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1
              }
            }
          ],
          as: "sender"
        }
      },

      {
        $unwind: {
          path: "$sender",
          preserveNullAndEmptyArrays: true
        }
      },

      // ✅ RECEIVER JOIN (myid)
      {
        $lookup: {
          from: "users",
          let: { receiverId: "$myid" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $convert: {
                        input: "$$receiverId",
                        to: "objectId",
                        onError: null,
                        onNull: null
                      }
                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1,
                profileImage: 1
              }
            }
          ],
          as: "receiver"
        }
      },

      {
        $unwind: {
          path: "$receiver",
          preserveNullAndEmptyArrays: true
        }
      },

      // ✅ FINAL FIELDS
      {
        $addFields: {
          sender_name: "$sender.name",
          receiver_name: "$receiver.name",
          receiver_image: "$receiver.profileImage"
        }
      },

      {
        $project: {
          sender: 0,
          receiver: 0
        }
      },

      {
        $sort: {
          date: -1
        }
      }

    ]);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRechargeHistory = async (req, res) => {
  try {

    const data = await Wallet.aggregate([

      // ✅ USER JOIN (user_id)
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $convert: {
                        input: "$$userId",
                        to: "objectId",
                        onError: null,
                        onNull: null
                      }
                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1,
                email: 1,
                profileImage: 1
              }
            }
          ],
          as: "user"
        }
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },

      // ✅ FINAL FIELDS
      {
        $addFields: {
          user_name: "$user.name",
          user_email: "$user.email",
          user_image: "$user.profileImage"
        }
      },

      {
        $project: {
          user: 0
        }
      },

      {
        $sort: {
          date: -1
        }
      }

    ]);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.withdrawalRequest = async (req, res) => {
  try {
    const { user_id, amount, bank_id } = req.body;

    // ✅ validation
    if (!user_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "User ID and amount required",
      });
    }

    const withdrawAmount = Number(amount);

    if (withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // ✅ user find
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ wallet check
    if (Number(user.wallet) < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // ✅ deduct wallet
    // user.wallet = Number(user.wallet) - withdrawAmount;
    // await user.save();

    // ✅ AUTO PAYMENT ID GENERATE
    const payment_id = "WD_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    // ✅ create withdrawal entry
    const withdrawal = await Withdrawal.create({
      user_id,
      amount: withdrawAmount,
      type: "Debit",
      status: "Pending", // admin approve karega
      payment_id,
      bank_id,
      date: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: withdrawal,
      wallet: user.wallet,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getWithdrawalHistory = async (req, res) => {
  try {

    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    /*
    =========================
    USER FETCH
    =========================
    */
    const user = await User.findById(user_id).select(
      "wallet getdailyLimit name email profileImage"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    =========================
    WITHDRAWAL DATA
    =========================
    */
    const data = await Withdrawal.aggregate([

      {
        $match: {
          user_id: user_id,
        },
      },

      /*
      =========================
      USER JOIN
      =========================
      */
      {
        $addFields: {
          userObjectId: {
            $toObjectId: "$user_id"
          }
        }
      },

      {
        $lookup: {
          from: "users",

          localField: "userObjectId",

          foreignField: "_id",

          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      /*
      =========================
      BANK JOIN
      =========================
      */

      {
        $addFields: {
          bankObjectId: {
            $toObjectId: "$bank_id"
          }
        }
      },

      {
        $lookup: {
          from: "bankaccounts",

          localField: "bankObjectId",

          foreignField: "_id",

          as: "bank",
        },
      },

      {
        $unwind: {
          path: "$bank",
          preserveNullAndEmptyArrays: true,
        },
      },

      /*
      =========================
      FINAL FIELDS
      =========================
      */
      {
        $addFields: {

          // USER
          user_name: "$user.name",

          user_email: "$user.email",

          user_image: "$user.profileImage",

          // BANK
          bank_name: "$bank.bank_name",

          account_holder_name:
            "$bank.account_holder_name",

          account_number:
            "$bank.account_number",

          ifsc_code:
            "$bank.ifsc_code",

          upi_id:
            "$bank.upi_id",

          bank_status:
            "$bank.status",
        },
      },

      /*
      =========================
      REMOVE EXTRA
      =========================
      */
      {
        $project: {
          user: 0,
          bank: 0,
          userObjectId: 0,
          bankObjectId: 0,
        },
      },

      /*
      =========================
      SORT
      =========================
      */
      {
        $sort: {
          date: -1,
        },
      },

    ]);

    /*
    =========================
    STATS
    =========================
    */

    let totalWithdrawal = 0;

    let todayWithdrawal = 0;

    const today = new Date();

    data.forEach((tx) => {

      const amount = Number(tx.amount || 0);

      totalWithdrawal += amount;

      const d = new Date(tx.date);

      if (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      ) {

        todayWithdrawal += amount;

      }

    });

    /*
    =========================
    FINAL STATS
    =========================
    */

    const wallet = user.wallet || 0;

    const todayEarning =
      user.getdailyLimit || 0;

    const availableAmount = wallet;

    const totalEarning =
      Number(wallet) +
      Number(totalWithdrawal);

    return res.status(200).json({

      success: true,

      data: data || [],

      stats: {

        wallet,

        availableAmount,

        totalWithdrawal,

        todayWithdrawal,

        todayEarning,

        totalEarning,

      },

    });

  } catch (error) {

    console.log(
      "Get Withdrawal History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getAdminWithdrawalHistory = async (req, res) => {
  try {

    /*
    =========================
    WITHDRAWAL DATA (ALL USERS)
    =========================
    */
    const data = await Withdrawal.aggregate([

      /*
      =========================
      USER OBJECT ID
      =========================
      */
      {
        $addFields: {
          userObjectId: {
            $toObjectId: "$user_id"
          }
        }
      },

      /*
      =========================
      USER JOIN
      =========================
      */
      {
        $lookup: {
          from: "users",

          localField: "userObjectId",

          foreignField: "_id",

          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      /*
      =========================
      BANK OBJECT ID
      =========================
      */
      {
        $addFields: {
          bankObjectId: {
            $toObjectId: "$bank_id"
          }
        }
      },

      /*
      =========================
      BANK JOIN
      =========================
      */
      {
        $lookup: {
          from: "bankaccounts",

          localField: "bankObjectId",

          foreignField: "_id",

          as: "bank",
        },
      },

      {
        $unwind: {
          path: "$bank",
          preserveNullAndEmptyArrays: true,
        },
      },

      /*
      =========================
      FINAL FIELDS
      =========================
      */
      {
        $addFields: {

          // USER
          user_name: "$user.name",

          user_email: "$user.email",

          user_wallet: "$user.wallet",

          user_image: "$user.profileImage",

          // BANK
          bank_name: "$bank.bank_name",

          account_holder_name:
            "$bank.account_holder_name",

          account_number:
            "$bank.account_number",

          ifsc_code:
            "$bank.ifsc_code",

          upi_id:
            "$bank.upi_id",

          bank_status:
            "$bank.status",
        },
      },

      /*
      =========================
      REMOVE EXTRA
      =========================
      */
      {
        $project: {
          user: 0,
          bank: 0,
          userObjectId: 0,
          bankObjectId: 0,
        },
      },

      /*
      =========================
      SORT
      =========================
      */
      {
        $sort: {
          date: -1,
        },
      },

    ]);

    /*
    =========================
    WITHDRAWAL STATS
    =========================
    */

    let totalWithdrawal = 0;

    let todayWithdrawal = 0;

    let pendingCount = 0;

    let completedAmount = 0;

    let pendingAmount = 0;

    const today = new Date();

    data.forEach((tx) => {

      const amount = Number(tx.amount || 0);

      totalWithdrawal += amount;

      const d = new Date(tx.date);

      if (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      ) {

        todayWithdrawal += amount;

      }

      if (tx.status === "Pending") {

        pendingCount += 1;

        pendingAmount += amount;

      }

      if (
        tx.status === "Success" ||
        tx.status === "Completed"
      ) {

        completedAmount += amount;

      }

    });

    /*
    =========================
    USER TABLE STATS
    =========================
    */
    const users = await User.find().select(
      "adminCommission wallet"
    );

    let totalCommission = 0;

    let totalWallet = 0;

    users.forEach((u) => {

      totalCommission += Number(
        u.adminCommission || 0
      );

      totalWallet += Number(
        u.wallet || 0
      );

    });

    /*
    =========================
    FINAL CALCULATIONS
    =========================
    */

    const totalPayments = data.length;

    const totalRevenue =
      totalWallet + totalCommission;

    /*
    =========================
    RESPONSE
    =========================
    */

    return res.status(200).json({

      success: true,

      data: data || [],

      stats: {

        totalWithdrawal,

        todayWithdrawal,

        totalPayments,

        pendingPayments: pendingCount,

        completedAmount,

        pendingAmount,

        totalCommission,

        totalWallet,

        totalRevenue,

      },

    });

  } catch (error) {

    console.log(
      "Admin Withdrawal History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    // ✅ VALID STATUS
    const validStatus = ["Pending", "Success", "Failed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // ✅ FIND WITHDRAWAL
    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    // ❌ already success
    if (withdrawal.status === "Success") {
      return res.status(400).json({
        success: false,
        message: "Already approved",
      });
    }

    /*
    =========================
    💰 WALLET LOGIC
    =========================
    */

    if (status === "Success") {
      const user = await User.findById(withdrawal.user_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // wallet check
      if (Number(user.wallet) < Number(withdrawal.amount)) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet",
        });
      }

      // 💸 deduct wallet
      user.wallet =
        Number(user.wallet) - Number(withdrawal.amount);

      await user.save();
    }

    // ❌ FAILED → no wallet change

    // ✅ UPDATE STATUS
    withdrawal.status = status;
    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      data: withdrawal,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.admindashboard = async (req, res) => {
  try {

    /*
    =========================
    👥 USERS & CREATORS
    =========================
    */
    const totalUsers = await User.countDocuments();

    const totalCreators = await User.countDocuments({
      role: "creator"
    });

    /*
    =========================
    💰 USERS WALLET + COMMISSION
    =========================
    */
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalWallet: { $sum: { $toDouble: "$wallet" } },
          totalCommission: { $sum: { $toDouble: "$adminCommission" } }
        }
      }
    ]);

    const totalWallet = userStats[0]?.totalWallet || 0;
    const totalCommission = userStats[0]?.totalCommission || 0;

    /*
    =========================
    💸 TOTAL TIPS
    =========================
    */
    const tipStats = await MyTip.aggregate([
      {
        $group: {
          _id: null,
          totalTips: { $sum: { $toDouble: "$token" } }
        }
      }
    ]);

    const totalTips = tipStats[0]?.totalTips || 0;

    /*
    =========================
    💳 SUCCESS WITHDRAWALS
    =========================
    */
    const withdrawalStats = await Withdrawal.aggregate([
      {
        $match: {
          status: { $in: ["Success", "Completed"] }
        }
      },
      {
        $group: {
          _id: null,
          totalWithdrawal: { $sum: { $toDouble: "$amount" } }
        }
      }
    ]);

    const totalWithdrawal = withdrawalStats[0]?.totalWithdrawal || 0;

    /*
    =========================
    🔥 TOTAL REVENUE
    =========================
    */
    const totalRevenue =
      totalWallet +
      totalCommission +
      totalWithdrawal;

    /*
    =========================
    🔴 LIVE USERS
    =========================
    */
    const liveUsers = await User.countDocuments({
      liveStatus: 1
    });

    /*
    =========================
    🧾 RECENT RECHARGE HISTORY (UPDATED)
    =========================
    */
    const recentTransactions = await Wallet.aggregate([

      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $convert: {
                        input: "$$userId",
                        to: "objectId",
                        onError: null,
                        onNull: null
                      }
                    }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1,
                email: 1,
                profileImage: 1
              }
            }
          ],
          as: "user"
        }
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $addFields: {
          user: "$user.name",
          email: "$user.email",
          image: "$user.profileImage",

          amount: "$amount",
          status: "$type", // Credit / Debit
          date: "$date"
        }
      },

      {
        $project: {
          user: 1,
          email: 1,
          image: 1,
          amount: 1,
          status: 1,
          date: 1
        }
      },

      { $sort: { date: -1 } },
      { $limit: 10 }

    ]);

    /*
    =========================
    🚀 RESPONSE
    =========================
    */
    res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalCreators,
        totalRevenue,

        totalWallet,
        totalCommission,
        totalTips,
        totalWithdrawal,

        liveUsers
      },

      recentTransactions
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.createVipAccess = async (req, res) => {
  try {

    const { user_id, creator_id } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!user_id || !creator_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and creator_id are required",
      });
    }

    // =========================
    // FIND USER
    // =========================
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // FIND CREATOR
    // =========================
    const creator = await User.findById(creator_id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator not found",
      });
    }

    // =========================
    // TOKEN AMOUNT
    // =========================
    const tokenAmount = 20;

    // =========================
    // WALLET CHECK
    // =========================
    if (Number(user.wallet) < tokenAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // =========================
    // CHECK EXISTING VIP ACCESS
    // =========================
    const alreadyVip = await VipAccess.findOne({
      user_id,
      creator_id,
      expire_date: { $gt: new Date() },
    });

    if (alreadyVip) {
      return res.status(400).json({
        success: false,
        message: "VIP Access already active",
      });
    }

    // =========================
    // DATES
    // =========================
    const added_date = new Date();

    // 30 days VIP
    const expire_date = new Date();
    expire_date.setDate(expire_date.getDate() + 30);

    // =========================
    // CREATE VIP ACCESS
    // =========================
    const vip = await VipAccess.create({
      user_id,
      creator_id,
      token: tokenAmount,
      added_date,
      expire_date,
    });

    // =========================
    // DEDUCT USER WALLET
    // =========================
    user.wallet = Number(user.wallet) - tokenAmount;
    await user.save();

    // =========================
    // RESPONSE
    // =========================
    res.status(201).json({
      success: true,
      message: "VIP Access Purchased Successfully",
      data: vip,
      deductedToken: tokenAmount,
      remainingWallet: user.wallet,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


exports.addBankAccount = async (req, res) => {
  try {

    const {
      user_id,
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      upi_id
    } = req.body;

    /*
    ==========================
    VALIDATION
    ==========================
    */

    if (
      !user_id ||
      !account_holder_name ||
      !bank_name ||
      !account_number ||
      !ifsc_code
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    /*
    ==========================
    CHECK USER
    ==========================
    */

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    ==========================
    DUPLICATE ACCOUNT CHECK
    ==========================
    */

    const alreadyExist = await BankAccount.findOne({
      user_id,
      account_number,
    });

    if (alreadyExist) {
      return res.status(400).json({
        success: false,
        message: "Bank account already added",
      });
    }

    /*
    ==========================
    OLD ACCOUNTS DEACTIVE
    ==========================
    */

    await BankAccount.updateMany(
      { user_id },
      {
        $set: {
          status: 0
        }
      }
    );

    /*
    ==========================
    CREATE NEW ACTIVE ACCOUNT
    ==========================
    */

    const bank = await BankAccount.create({
      user_id,

      account_holder_name,

      bank_name,

      account_number,

      ifsc_code,

      upi_id: upi_id || "",

      status: 1 // active
    });

    /*
    ==========================
    RESPONSE
    ==========================
    */

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: bank,
    });

  } catch (error) {

    console.log("Add Bank Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getBankAccounts = async (req, res) => {
  try {

    const { user_id } = req.params;

    /*
    ==========================
    VALIDATION
    ==========================
    */

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    /*
    ==========================
    CHECK USER
    ==========================
    */

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    ==========================
    FETCH BANK ACCOUNTS
    ==========================
    */

    const bankAccounts = await BankAccount.find({
      user_id,
      
    }).sort({ createdAt: -1 });

    /*
    ==========================
    RESPONSE
    ==========================
    */

    return res.status(200).json({
      success: true,
      message: "Bank accounts fetched successfully",
      data: bankAccounts,
    });

  } catch (error) {

    console.log(
      "Fetch Bank Accounts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateBankStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const { status, user_id } = req.body;

    const bank = await BankAccount.findById(id);

    if (!bank) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    // ACTIVE KARNE PE
    if (Number(status) === 1) {

      // sabko deactive
      await BankAccount.updateMany(
        { user_id },
        {
          $set: {
            status: 0
          }
        }
      );

      // selected active
      bank.status = 1;

    } else {

      // check minimum 1 active
      const activeCount =
        await BankAccount.countDocuments({
          user_id,
          status: 1
        });

      if (
        activeCount <= 1 &&
        bank.status === 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one active bank account required",
        });
      }

      bank.status = 0;
    }

    await bank.save();

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: bank,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};