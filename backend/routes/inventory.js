const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

/* ──────────────────────────────────────────
 *  GET /api/inventory
 *  Returns all products with inventory-relevant
 *  fields only (lighter payload than full products)
 * ────────────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const { status, category, search, sort = "stock", order = "asc" } = req.query;

    const filter = {};

    // Stock status filter
    if (status === "inStock") filter.stock = { $gt: 10 };
    else if (status === "lowStock") {
      filter.stock = { $gt: 0, $lte: 10 };
    } else if (status === "outOfStock") {
      filter.$or = [{ stock: 0 }, { stock: { $exists: false } }, { inStock: false }];
    }

    // Category filter
    if (category) filter.category = { $regex: new RegExp(category, "i") };

    // Search
    if (search) {
      const searchFilter = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
        delete filter.$or;
      } else {
        filter.$or = searchFilter;
      }
    }

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .select("name slug image category stock inStock price originalPrice badge fabric createdAt updatedAt")
      .sort(sortObj);

    res.json(products);
  } catch (err) {
    console.error("GET /api/inventory error:", err);
    res.status(500).json({ message: "Failed to fetch inventory", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  GET /api/inventory/summary
 *  Returns inventory statistics
 * ────────────────────────────────────────── */
router.get("/summary", async (req, res) => {
  try {
    const [stats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          inStock: {
            $sum: { $cond: [{ $gt: ["$stock", 10] }, 1, 0] },
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 10] }] },
                1,
                0,
              ],
            },
          },
          outOfStock: {
            $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
          },
        },
      },
    ]);

    // Category breakdown
    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          value: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
      { $sort: { totalStock: -1 } },
    ]);

    res.json({
      summary: stats || {
        totalProducts: 0,
        totalStock: 0,
        totalValue: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
      },
      categoryBreakdown,
    });
  } catch (err) {
    console.error("GET /api/inventory/summary error:", err);
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PATCH /api/inventory/:id/stock
 *  Quick stock update for a single product
 *  Body: { stock: number }
 * ────────────────────────────────────────── */
router.patch("/:id/stock", async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock === null || stock < 0) {
      return res.status(400).json({ message: "Valid stock value is required (>= 0)" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: parseInt(stock), inStock: parseInt(stock) > 0 },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("PATCH /api/inventory/:id/stock error:", err);
    res.status(500).json({ message: "Failed to update stock", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PATCH /api/inventory/bulk-update
 *  Update stock for multiple products at once
 *  Body: { updates: [{ id, stock }] }
 * ────────────────────────────────────────── */
router.patch("/bulk-update", async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Updates array is required" });
    }

    const bulkOps = updates.map(({ id, stock }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { stock: parseInt(stock), inStock: parseInt(stock) > 0 } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps);

    res.json({
      message: `Successfully updated ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("PATCH /api/inventory/bulk-update error:", err);
    res.status(500).json({ message: "Failed to bulk update", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  GET /api/inventory/low-stock
 *  Returns products with stock <= threshold
 *  Query: ?threshold=10 (default 10)
 * ────────────────────────────────────────── */
router.get("/low-stock", async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const products = await Product.find({
      stock: { $gt: 0, $lte: threshold },
    })
      .select("name slug image category stock price badge")
      .sort({ stock: 1 });

    res.json(products);
  } catch (err) {
    console.error("GET /api/inventory/low-stock error:", err);
    res.status(500).json({ message: "Failed to fetch low stock", error: err.message });
  }
});

module.exports = router;
