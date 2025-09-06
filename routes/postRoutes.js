const router = require("express").Router();
const Post = require("../models/Post");
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

/**
 * CREATE Post (Admin only)
 * multipart/form-data fields:
 *  - title (text)
 *  - content (text)
 *  - category (text)
 *  - image (file, optional)
 *  - file (file, optional)
 */
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const { title, content, category, status } = req.body;

      const newPost = await Post.create({
        title,
        content,
        category,
        status: status || "published",
        image: req.files?.image?.[0]
          ? "/uploads/images/" + req.files.image[0].filename
          : null,
        file: req.files?.file?.[0]
          ? "/uploads/files/" + req.files.file[0].filename
          : null,
        author: req.user.id,
      });

      res.status(201).json(newPost);
    } catch (err) {
      next(err);
    }
  }
);

// GET all posts (with pagination & filters)
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const category = req.query.category;
    const status = req.query.status || "published";
    const search = req.query.search;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate("author", "username email isAdmin")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (err) {
    next(err);
  }
});

// GET single post by id or slug
router.get("/:idOrSlug", async (req, res, next) => {
  try {
    const key = req.params.idOrSlug;
    const query = key.match(/^[0-9a-fA-F]{24}$/) ? { _id: key } : { slug: key };

    const post = await Post.findOne(query).populate(
      "author",
      "username email isAdmin"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// UPDATE post (Admin only) — image/file optional
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const updates = {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        status: req.body.status,
      };

      if (req.files?.image?.[0])
        updates.image = "/uploads/images/" + req.files.image[0].filename;
      if (req.files?.file?.[0])
        updates.file = "/uploads/files/" + req.files.file[0].filename;

      const post = await Post.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE post (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
