const { RtcTokenBuilder, RtcRole } = require("agora-token");
const User = require("../models/MainModel");
const Menu = require("../models/TipModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role, gender, country } = req.body;

    // 🔍 check email
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ☁️ S3 image
    let profileImage = "";

    if (req.file && req.file.location) {
      profileImage = req.file.location; // ✅ S3 URL
    }

    // 👤 create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      gender: gender || "others",
      country: country || "India",
      profileImage,
      wallet: "0",
      vendor_id: "",
      liveStatus: 0,
      registerDate: new Date(),
    });

    // 🎟 JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: "Registered Successfully",
      token,
      user: userData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 2️⃣ Check password match
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 3️⃣ Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Remove password from response
    const userData = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      gender: user.gender,
      wallet: user.wallet,
      profileImage: user.profileImage || "",
      vendor_id: user.vendor_id || "",
      liveStatus: user.liveStatus || 0,
      registerDate: user.registerDate || user.createdAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      __v: user.__v,
    };

    // 5️⃣ Final response (Exactly like you want)
    res.status(200).json({
      message: "Login Successful",
      token,
      user: userData,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLiveStatus = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    let targetUser;

    if (req.user.role === "admin" && req.body.user_id) {
      targetUser = await User.findById(req.body.user_id);
    } else {
      targetUser = await User.findById(req.user._id);
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      targetUser.role !== "creator"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only creators can go live",
      });
    }

    // toggle live
    targetUser.liveStatus = targetUser.liveStatus === 1 ? 0 : 1;

    let agoraData = null;

    if (targetUser.liveStatus === 1) {

      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;

      const channelName = `creator_${targetUser._id}`;
      const uid = 0;

      const role = RtcRole.PUBLISHER;

      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpireTime =
        currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        privilegeExpireTime
      );

      agoraData = {
        appId,
        channel: channelName,
        token,
        uid,
        tokenExpireAt: privilegeExpireTime
      };

      // 🔴 SAVE TO DATABASE
      targetUser.agora = agoraData;

    } else {

      // ⚫ offline hone par remove
      targetUser.agora = null;

    }

    await targetUser.save();

    const userData = targetUser.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message:
        targetUser.liveStatus === 1
          ? "You are Live Now 🔴"
          : "You are Offline ⚫",
      liveStatus: targetUser.liveStatus,
      agora: agoraData,
      user: userData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.setDailyLimit = async (req, res) => {
  try {

    const userId = req.user._id;
    const { dailyLimit } = req.body;

    if (!dailyLimit) {
      return res.status(400).json({
        success: false,
        message: "Daily limit required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { dailyLimit,
        getdailyLimit: '0',
        tokenDate: new Date()
       },
      
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Daily limit updated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.setPrivateShow = async (req, res) => {
  try {

    const userId = req.user._id;

    const {
      privateShowAmount,
      exclusiveShowAmount
    } = req.body;

    // validation
    if (!privateShowAmount || !exclusiveShowAmount) {
      return res.status(400).json({
        success: false,
        message: "Private chat, Exclusive show and Daily limit required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // update fields
    user.privateShowAmount = privateShowAmount;
    user.exclusiveShowAmount = exclusiveShowAmount;

    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Private show settings updated successfully",
      data: {
        privateShowAmount: user.privateShowAmount,
        exclusiveShowAmount: user.exclusiveShowAmount
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



exports.getLiveStatus = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      liveStatus: user.liveStatus,
      user: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL USERS =================
exports.getUsers = async (req, res) => {
  try {

    // ✅ Common filter
    const baseFilter = {
      liveStatus: 1,
      gender: "female",
    };

    // 🔴 1. Live Users (simple)
    const liveUsers = await User.find(baseFilter).select("-password");

    // 🌍 2. India Live Users
    const indiaUsers = await User.find({
      ...baseFilter,
      country: "India",
    }).select("-password");

    // 🇺🇸 3. USA Live Users
    const usaUsers = await User.find({
      ...baseFilter,
      country: "USA",
    }).select("-password");

    // 🎲 4. Random Live Users
    const randomUsers = await User.aggregate([
      {
        $match: baseFilter,
      },
      {
        $sample: { size: 10 }, // jitne random chahiye utna change kar
      },
      {
        $project: { password: 0 },
      },
    ]);

    res.json({
      liveUsers,
      indiaUsers,
      usaUsers,
      randomUsers,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLiveUsers = async (req, res) => {
  try {

    // ✅ Common filter
    const baseFilter = {
      liveStatus: 1,
      gender: "female",
    };

    
    // 🎲 4. Random Live Users
    const liveUsers = await User.aggregate([
      {
        $match: baseFilter,
      },
      {
        $sample: { size: 50 }, // jitne random chahiye utna change kar
      },
      {
        $project: { password: 0 },
      },
    ]);

    res.json({
      liveUsers,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ base filter
    const baseFilter = {
      liveStatus: 1,
      gender: "female",
    };

    // 🔴 Single User
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🇮🇳 India Users
    const indiaUsers = await User.find({
      ...baseFilter,
      country: "India",
      _id: { $ne: id }, // current user ko remove
    }).select("-password");

    // 🎲 Related Users (Random)
    const relatedUsers = await User.aggregate([
      {
        $match: {
          liveStatus: 1,
          gender: "female",
          _id: { $ne: user._id },
        },
      },
      {
        $sample: { size: 10 },
      },
      {
        $project: { password: 0 },
      },
    ]);

    res.json({
      user,
      indiaUsers,
      relatedUsers,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= RAZORPAY ORDER =================

exports.createRazorpayOrder = async (req, res) => {
  try {

    const { user_id, email, phone, name, amount } = req.body;

    if (!user_id || !email || !phone || !name || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // amount paise me convert hota hai
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id,
        email,
        phone,
        name,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



exports.verifyPayment = async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    user_id
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

  const senderUser = await User.findById(user_id);

  if (!senderUser) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const rechargeAmount = Number(amount);
  const currentWallet = Number(senderUser.wallet);

  if (rechargeAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount"
    });
  }

  // deduct wallet
  senderUser.wallet = currentWallet + rechargeAmount;

  await senderUser.save();

  return res.json({
    success: true,
    message: "Wallet deducted successfully",
    wallet: senderUser.wallet
  });

} else {

    res.status(400).json({
      success: false,
      message: "Invalid signature"
    });

  }
};


// ================= DELETE USER =================
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
