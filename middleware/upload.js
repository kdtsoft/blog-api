const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads dir
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// File filter (image/* বা যেকোনো ফাইল—দুটিই allow করবো, তবে mime check আলাদা ফিল্ডে)
function fileFilter(req, file, cb) {
  // উদাহরণ: ছবি হলে image ফিল্ডে আসবে, নাহলে file ফিল্ডে
  const isImageField = file.fieldname === "image";
  if (isImageField) {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files allowed in 'image' field"));
  }
  // generic file field — allow anything
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB প্রতি ফাইল
});

module.exports = upload;
