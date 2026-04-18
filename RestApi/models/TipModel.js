const mongoose = require("mongoose");

/*
========================
MENU SCHEMA
========================
*/

const menuSchema = new mongoose.Schema(
  {
    title: String,

    tiptype: {
      type: String,
      enum: ["Tip", "Toy"],
      default: "Tip",
    },

    amount: {
      type: String,
      default: "",
    },

    user_id: {
      type: String,
      default: "",
    },

    addedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


/*
========================
MY TIP SCHEMA
========================
*/

const myTipSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      default: "",
    },

    token: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["Tip", "Toy", "Private", "Exclusive"],
      default: "Tip",
    },

    msg: {
      type: String,
      default: "",
    },

    myid: {
      type: String, // creator id
      default: "",
    },
    

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const PrivateShowSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: ["Private", "Exclusive"],
      default: "Private",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Running", "Completed", "Rejected"],
      default: "Pending",
    },

    showStartTime: {
      type: Date,
      default: null,
    },

    showEndTime: {
      type: Date,
      default: null,
    },

    channelName: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0, // minutes
    },

    viewerUid: {
      type: Number,
      default: 0
    },

    creatorUid: {
      type: Number,
      default: 0
    },

    viewerToken: {
      type: String,
      default: ""
    },

    creatorToken: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);




/*
========================
EXPORT MODELS
========================
*/

const walletSchema = new mongoose.Schema({
  user_id: String,
  amount: Number,
  type: String, // Credit / Debit
  status: String,
  payment_id: String,
  order_id: String,
  date: Date
}, { timestamps: true });


const withdrawalSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String, // Credit / Debit
      enum: ["Credit", "Debit"],
      default: "Debit",
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    payment_id: {
      type: String,
      default: "",
    },
    
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const settingSchema = new mongoose.Schema(
  {
    commission: Number,
    minWithdraw: Number,
    maxDaily: Number,
    maintenance: Boolean,

    ownerName: String,
    companyName: String,
    email: String,
    phone: String,
    domain: String,

    privacyPolicy: String,
    refundPolicy: String,
    settlementPolicy: String,

    aboutUs: String,

    userTerms: String,
    creatorTerms: String,

    instagram: String,
    facebook: String,
    twitter: String,
  },
  { timestamps: true }
);






const Menu = mongoose.model("Menu", menuSchema);
const MyTip = mongoose.model("Mytip", myTipSchema);
const PrivateShow = mongoose.model("PrivateShow", PrivateShowSchema);
const Wallet = mongoose.model("Wallet", walletSchema);
const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
const Setting = mongoose.model("Setting", settingSchema);

module.exports = {
  Menu,
  MyTip,
  PrivateShow,
  Wallet,
  Withdrawal,
  Setting,
};