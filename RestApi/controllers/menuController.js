const { RtcTokenBuilder, RtcRole } = require("agora-token");
const { Menu, MyTip, PrivateShow } = require("../models/TipModel");
const User = require("../models/MainModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


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

    // wallet check
    if (Number(senderUser.wallet) < Number(token)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // tip create
    const tip = await MyTip.create({
      sender_id,
      token,
      type: type || "Tip",
      msg,
      myid,
      date: new Date(),
    });

    // sender wallet minus
    senderUser.wallet = Number(senderUser.wallet) - Number(token);
    await senderUser.save();

    // receiver getdailyLimit plus
    receiverUser.getdailyLimit =
      Number(receiverUser.getdailyLimit || 0) + Number(token);

    await receiverUser.save();

    res.status(201).json({
      success: true,
      message: "Token Submitted Successfully",
      data: tip,
      senderWallet: senderUser.wallet,
      receiverTodayToken: receiverUser.getdailyLimit,
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

    // channel generate
    const channelName = `private_sudip`;

    // uid generate
    const viewerUid = Math.floor(Math.random() * 100000);
    const creatorUid = Math.floor(Math.random() * 100000);

    // token expire time (1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime =
      currentTimestamp + expirationTimeInSeconds;

    // viewer token
    const viewerToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      viewerUid,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );

    // creator token
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