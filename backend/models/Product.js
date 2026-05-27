const mongoose = require("mongoose");

const colorVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    video: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true, trim: true },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    fabric: { type: String, default: "" },
    color: { type: String, default: "" },
    colorVariants: { type: [colorVariantSchema], default: [] },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 },
    sizes: { type: [String], default: [] },
    discountPercent: { type: Number, default: null },
    isFeatured: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: { type: [String], default: [] },
    weight: { type: String, default: "" },
    dimensions: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual id field for frontend compatibility
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Product", productSchema);

