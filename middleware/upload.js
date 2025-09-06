const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folders exist
const uploadBase = path.join(__dirname, "..", "uploads");
const imageDir = path.join(uploadBase, "images");
const fileDir = path.join(uploadBase, "files");

if (!fs.existsSync(uploadBase)) fs.mkdirSync(uploadBase);
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir);
if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir);

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") cb(null, imageDir);
    else cb(null, fileDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// File filter
function fileFilter(req, file, cb) {
  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files allowed in 'image' field"));
  }
  // generic file field — allow anything
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;
