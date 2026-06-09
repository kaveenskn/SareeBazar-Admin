const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Admin can reply to a review
    adminReply: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    adminRepliedAt: {
      type: Date,
      default: null,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews: one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual id field for frontend compatibility
reviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

/**
 * After saving/removing a review, recalculate the product's
 * average rating and review count.
 */
reviewSchema.statics.calcAverageRating = async function (productId) {
  const Product = mongoose.model("Product");

  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviews: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

// Recalculate after findOneAndDelete
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.product);
  }
});



module.exports = mongoose.model("Review", reviewSchema);
