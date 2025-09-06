const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware"); // protect middleware import

// -------------------- Register --------------------
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, password required" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash, isAdmin: !!isAdmin });

    res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    next(err);
  }
});

// -------------------- Login --------------------
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    next(err);
  }
});

// -------------------- Profile --------------------
// GET /api/auth/profile
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // password hide
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
