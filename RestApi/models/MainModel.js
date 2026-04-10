const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    username: {
    type: String,
    required: true,
    unique: true,
    },


    email: {
      type: String,
      unique: true,
    },

    password: String,

    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user",
    },

    gender: {
      type: String,
      enum: ["male", "female", "gay", "others"],
      default: "others",
    },

    country: {
      type: String,
      enum: ["India", "USA", "UK", "Canada", "Australia", "Other"],
      default: "Other",
    },

    profileImage: {
      type: String,
      default: "",
    },

    wallet: {
      type: String,
      default: "",
    },

    vendor_id: {
      type: String,
      default: "",
    },

    liveStatus: {
      type: Number,
      default: 0,
    },

    dailyLimit: {
      type: Number,
      default: 0,
    },

    privateShowAmount: {
      type: Number,
      default: 0,
    },

    exclusiveShowAmount: {
      type: Number,
      default: 0,
    },

    getdailyLimit: {
      type: Number,
      default: 0,
    },

    agora: {
      appId: String,
      channel: String,
      token: String,
      uid: String,
      tokenExpireAt: Number
    },

    registerDate: {
      type: Date,
      default: Date.now,
    },

    tokenDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
