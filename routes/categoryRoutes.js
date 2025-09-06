const router = require("express").Router();
const Category = require("../models/Category");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// GET all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST create category
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PUT update category
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE category
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
