const { RtcTokenBuilder, RtcRole } = require("agora-token");
const { Menu, MyTip, PrivateShow, Wallet, Withdrawal, Setting  } = require("../models/TipModel");
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

      const { sender_id, token, type, msg, myid } = req.body;

      if (!sender_id || !token || !msg || !myid) {
        return res.status(400).json({
          success: false,
          message: "All fields required",
        });
      }

      // sender user
      const senderUser = await User.findById(sender_id);

      if (!senderUser) {
        return res.status(404).json({
          success: false,
          message: "Sender not found",
        });
      }

      // receiver user
      const receiverUser = await User.findById(myid);

      if (!receiverUser) {
        return res.status(404).json({
          success: false,
          message: "Receiver not found",
        });
      }

      const amount = Number(token);

      // wallet check
      if (Number(senderUser.wallet) < amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      /*
      ==========================
      💰 CALCULATION
      ==========================
      */
      const adminCommission = Number((amount * 30) / 100);
      const creatorAmount = amount - adminCommission;

      // tip create
      const tip = await MyTip.create({
        sender_id,
        token: amount,
        type: type || "Tip",
        msg,
        myid,
        adminCommission,
        creatorAmount,
        date: new Date(),
      });

      /*
      ==========================
      WALLET UPDATE
      ==========================
      */

      // sender wallet minus full
      senderUser.wallet = Number(senderUser.wallet) - amount;
      await senderUser.save();

      // receiver gets ONLY 70%
      receiverUser.wallet =
        Number(receiverUser.wallet || 0) + creatorAmount;

      // optional stats
      receiverUser.getdailyLimit =
        Number(receiverUser.getdailyLimit || 0) + Number(token);;

      // 💡 30% commission store in user table
      receiverUser.adminCommission =
        Number(receiverUser.adminCommission || 0) + adminCommission;

      await receiverUser.save();

      res.status(201).json({
        success: true,
        message: "Token Submitted Successfully",
        data: tip,

        breakdown: {
          total: amount,
          adminCommission,
          creatorAmount,
        },

        senderWallet: senderUser.wallet,
        receiverWallet: receiverUser.wallet,
      });

    } catch (error) {
      res.status(500).json({
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

    const channelName = `private_sudip`;

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

    /*
    ==========================
    💰 WALLET UPDATE (NEW)
    ==========================
    */

    // sender wallet minus
    senderUser.wallet =
      Number(senderUser.wallet) - Number(token);
    await senderUser.save();

    // creator earning increase
    creatorUser.getdailyLimit =
      Number(creatorUser.getdailyLimit || 0) + Number(token);

    await creatorUser.save();

    // ✅ ALSO SAVE IN TIP COLLECTION (NEW)
      const tip = await MyTip.create({
        sender_id,
        token,
        type: type || "Private",
        msg: "Private show request",
        myid,
        date: new Date(),
      });
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
      viewerToken,
      creatorToken,
      showStartTime: null,
      showEndTime: null,
      duration: 0,
    });

    res.status(201).json({
      success: true,
      message: "Private show request sent",
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

// const { MyTip } = require("../models/menuMyTip");

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
    const { user_id, amount } = req.body;

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
    USER FETCH (IMPORTANT FIX)
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
                        onNull: null,
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
                profileImage: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          user_name: "$user.name",
          user_email: "$user.email",
          user_image: "$user.profileImage",
        },
      },
      {
        $project: {
          user: 0,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);

    /*
    =========================
    STATS CALCULATION (SAFE)
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
    FINAL SAFE STATS
    =========================
    */

    const wallet = user.wallet || 0;
    const todayEarning = user.getdailyLimit || 0;

    const availableAmount = wallet;

    // safe calculation
    const totalEarning = Number(wallet) + Number(totalWithdrawal);

    res.status(200).json({
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
    console.log(error);

    res.status(500).json({
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
                        onNull: null,
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
                profileImage: 1,
                wallet: 1,            // ✅ ADD THIS
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          user_name: "$user.name",
          user_email: "$user.email",
          user_wallet: "$user.wallet", // ✅ NOW WORKING
          user_image: "$user.profileImage",
        },
      },
      {
        $project: {
          user: 0,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);

    /*
    =========================
    🔥 WITHDRAWAL STATS
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

      if (tx.status === "Success" || tx.status === "Completed") {
        completedAmount += amount;
      }
    });

    /*
    =========================
    👥 USER TABLE STATS
    =========================
    */
    const users = await User.find().select("adminCommission wallet");

    let totalCommission = 0;
    let totalWallet = 0;

    users.forEach((u) => {
      totalCommission += Number(u.adminCommission || 0);
      totalWallet += Number(u.wallet || 0); // ✅ ADD THIS
    });

    /*
    =========================
    💰 FINAL CALCULATIONS
    =========================
    */

    const totalPayments = data.length;

    // ✅ FIXED REVENUE
    const totalRevenue = totalWallet + totalCommission;

    /*
    =========================
    RESPONSE
    =========================
    */
    res.status(200).json({
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
        totalWallet,       // ✅ EXTRA FIELD (useful frontend me)
        totalRevenue,      // ✅ CORRECTED
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


