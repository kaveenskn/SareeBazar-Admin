const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

/* ──────────────────────────────────────────
 *  GET /api/reviews/product/:productId
 *  Get all approved reviews for a product
 *  Query params:
 *    ?sort=createdAt   → sort field (createdAt | rating)
 *    ?order=desc       → sort direction
 *    ?page=1           → pagination page
 *    ?limit=10         → results per page
 * ────────────────────────────────────────── */
router.get("/product/:productId", async (req, res) => {
  try {
    const {
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      product: req.params.productId,
      isApproved: true,
    };

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);

    // Calculate rating breakdown (how many 5★, 4★, etc.)
    const breakdown = await Review.aggregate([
      { $match: filter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const ratingBreakdown = {};
    for (let i = 1; i <= 5; i++) ratingBreakdown[i] = 0;
    breakdown.forEach((b) => {
      ratingBreakdown[b._id] = b.count;
    });

    res.json({
      reviews,
      ratingBreakdown,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("GET /api/reviews/product/:productId error:", err);
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  POST /api/reviews/product/:productId
 *  Create a review (authenticated user)
 * ────────────────────────────────────────── */
router.post("/product/:productId", protect, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    // Validate
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      user: req.userId,
      product: req.params.productId,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Check if user has purchased this product (verified purchase)
    const hasOrdered = await Order.findOne({
      user: req.userId,
      "items.slug": product.slug,
      status: "delivered",
    });

    const review = await Review.create({
      user: req.userId,
      product: req.params.productId,
      rating,
      title: title || "",
      comment,
      isVerifiedPurchase: !!hasOrdered,
    });

    const populated = await review.populate("user", "name");

    res.status(201).json({ review: populated });
  } catch (err) {
    console.error("POST /api/reviews/product/:productId error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: "Failed to create review", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PUT /api/reviews/:reviewId
 *  Update own review (authenticated user)
 * ────────────────────────────────────────── */
router.put("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the review author can update
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    const { rating, title, comment } = req.body;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;

    const updated = await review.save();
    const populated = await updated.populate("user", "name");

    res.json({ review: populated });
  } catch (err) {
    console.error("PUT /api/reviews/:reviewId error:", err);
    res.status(500).json({ message: "Failed to update review", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  DELETE /api/reviews/:reviewId
 *  Delete own review (authenticated user)
 * ────────────────────────────────────────── */
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the review author can delete
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findOneAndDelete({ _id: req.params.reviewId });

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/reviews/:reviewId error:", err);
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
});

/* ══════════════════════════════════════════
 *  ADMIN ROUTES
 * ══════════════════════════════════════════ */

/* ──────────────────────────────────────────
 *  GET /api/reviews/admin/all
 *  Get all reviews (admin, no auth for demo)
 *  Query params:
 *    ?approved=true|false  → filter by approval
 *    ?rating=5             → filter by rating
 *    ?product=<id>         → filter by product
 *    ?sort=createdAt       → sort field
 *    ?order=desc           → sort direction
 *    ?page=1 &limit=20
 * ────────────────────────────────────────── */
router.get("/admin/all", async (req, res) => {
  try {
    const {
      approved,
      rating,
      product,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (approved !== undefined) filter.isApproved = approved === "true";
    if (rating) filter.rating = parseInt(rating);
    if (product) filter.product = product;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("product", "name slug image")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("GET /api/reviews/admin/all error:", err);
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PATCH /api/reviews/admin/:reviewId/approve
 *  Toggle review approval (admin)
 * ────────────────────────────────────────── */
router.patch("/admin/:reviewId/approve", async (req, res) => {
  try {
    const { isApproved } = req.body;

    if (isApproved === undefined) {
      return res.status(400).json({ message: "isApproved is required" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved },
      { new: true }
    )
      .populate("user", "name email")
      .populate("product", "name slug image");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Recalculate product rating after approval change
    await Review.calcAverageRating(review.product._id);

    res.json({ review });
  } catch (err) {
    console.error("PATCH /api/reviews/admin/:reviewId/approve error:", err);
    res.status(500).json({ message: "Failed to update review", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PATCH /api/reviews/admin/:reviewId/reply
 *  Admin replies to a review
 * ────────────────────────────────────────── */
router.patch("/admin/:reviewId/reply", async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      {
        adminReply: adminReply.trim(),
        adminRepliedAt: new Date(),
      },
      { new: true }
    )
      .populate("user", "name email")
      .populate("product", "name slug image");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ review });
  } catch (err) {
    console.error("PATCH /api/reviews/admin/:reviewId/reply error:", err);
    res.status(500).json({ message: "Failed to reply to review", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  DELETE /api/reviews/admin/:reviewId
 *  Admin deletes a review
 * ────────────────────────────────────────── */
router.delete("/admin/:reviewId", async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/reviews/admin/:reviewId error:", err);
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  GET /api/reviews/admin/stats
 *  Review statistics for the admin dashboard
 * ────────────────────────────────────────── */
router.get("/admin/stats", async (req, res) => {
  try {
    const [totalReviews, pendingApproval, avgRating, ratingDistribution, recentReviews] =
      await Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ isApproved: false }),
        Review.aggregate([
          { $match: { isApproved: true } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]),
        Review.aggregate([
          { $match: { isApproved: true } },
          { $group: { _id: "$rating", count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
        ]),
        Review.find()
          .populate("user", "name")
          .populate("product", "name slug")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    const breakdown = {};
    for (let i = 1; i <= 5; i++) breakdown[i] = 0;
    ratingDistribution.forEach((r) => {
      breakdown[r._id] = r.count;
    });

    res.json({
      totalReviews,
      pendingApproval,
      averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avg * 10) / 10 : 0,
      ratingDistribution: breakdown,
      recentReviews,
    });
  } catch (err) {
    console.error("GET /api/reviews/admin/stats error:", err);
    res.status(500).json({ message: "Failed to fetch review stats", error: err.message });
  }
});

module.exports = router;
