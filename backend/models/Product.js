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

// Pre-save hook: auto-compute sale price
productSchema.pre("save", function () {
  if (this.status === "sale" && this.discountPercent > 0) {
    // If originalPrice is not already set, the entered price IS the MRP
    if (!this.originalPrice || this.isModified("discountPercent") || this.isModified("price")) {
      // Only set originalPrice from price when first setting up the sale
      // or when price was explicitly changed (not from our own computation)
      if (!this.originalPrice || this.isModified("price")) {
        this.originalPrice = this.price;
      }
      this.price = Math.round(this.originalPrice * (1 - this.discountPercent / 100) * 100) / 100;
    }
  } else if (this.status !== "sale") {
    // Clear sale-related fields when not a sale product
    this.originalPrice = null;
    this.discountPercent = null;
  }
});

// Virtual id field for frontend compatibility
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Product", productSchema);

