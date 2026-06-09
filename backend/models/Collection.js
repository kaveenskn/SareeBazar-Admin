const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual id field for frontend compatibility
collectionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Collection", collectionSchema);
