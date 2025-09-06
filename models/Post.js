const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, default: "" },
    category: { type: String, default: "general" },
    image: { type: String, default: null }, // /uploads/xxx.jpg
    file: { type: String, default: null },  // /uploads/xxx.pdf
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "published" }
  },
  { timestamps: true }
);

// auto-slug
postSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
