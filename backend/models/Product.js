const mongoose = require("mongoose");

const colorVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
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
    collection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
    status: { type: String, enum: ["", "trending", "latest", "sale"], default: "" },
    description: { type: String, default: "" },
    fabric: { type: String, default: "" },
    color: { type: String, default: "" },
    colorVariants: { type: [colorVariantSchema], default: [] },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 },
    sizes: { type: [String], default: [] },
    discountPercent: { type: Number, default: null },
    isFeatured: { type: Boolean, default: false },
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

// Pre-save hook: auto-compute total stock from color variants
productSchema.pre("save", function () {
  if (this.colorVariants && this.colorVariants.length > 0) {
    this.stock = this.colorVariants.reduce((sum, cv) => sum + (cv.stock || 0), 0);
    this.inStock = this.stock > 0;
  }
});

// Note: Sale price is computed on the frontend as: price * (1 - discountPercent/100)
// price = selling price (always stays unchanged)
// originalPrice = cost price (admin-only, for profit tracking)
// discountPercent = sale discount percentage (only when status === "sale")

// Virtual id field for frontend compatibility
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Product", productSchema);

