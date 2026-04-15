const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../utils/s3");

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/png",
    "image/webp",
    "image/jpeg",
    "image/jpg",
    "video/mp4",
    "audio/mpeg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (png/jpg/jpeg), mp4 videos and mp3 allowed"));
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,

    // ❌ ACL deprecated in some buckets (optional safe fallback)
    // acl: "public-read",

    key: function (req, file, cb) {
      const ext = file.originalname.split(".").pop();
      const fileName = `${file.fieldname}-${Date.now()}.${ext}`;

      cb(null, `uploads/${fileName}`); // 👈 clean folder structure
    },
  }),

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;