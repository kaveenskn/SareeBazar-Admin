const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

/* ──────────────────────────────────────────
 *  GET /api/products
 *  Query params:
 *    ?badge=Sale        → filter by badge
 *    ?category=Silk     → filter by category
 *    ?featured=true     → only featured
 *    ?trending=true     → only trending
 *    ?latest=true       → only latest
 *    ?search=kanjivaram  → text search
 *    ?limit=10          → limit results
 *    ?sort=price        → sort field
 *    ?order=asc         → sort direction
 * ────────────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const {
      badge,
      category,
      featured,
      trending,
      latest,
      search,
      limit,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (badge) filter.badge = { $regex: new RegExp(`^${badge}$`, "i") };
    if (category) filter.category = { $regex: new RegExp(category, "i") };
    if (featured === "true") filter.isFeatured = true;
    if (trending === "true") filter.isTrending = true;
    if (latest === "true") filter.isLatest = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { fabric: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    let query = Product.find(filter).sort(sortObj);
    if (limit) query = query.limit(parseInt(limit));

    const products = await query;
    res.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  GET /api/products/:slug
 *  Get a single product by slug
 * ────────────────────────────────────────── */
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("GET /api/products/:slug error:", err);
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  POST /api/products
 *  Create a new product
 * ────────────────────────────────────────── */
router.post("/", async (req, res) => {
  try {
    const productData = req.body;

    // Auto-generate slug
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Make slug unique by appending timestamp if it already exists
    const existingSlug = await Product.findOne({ slug: productData.slug });
    if (existingSlug) {
      productData.slug = `${productData.slug}-${Date.now()}`;
    }

    // Set inStock based on stock
    productData.inStock = (productData.stock ?? 0) > 0;

    const product = new Product(productData);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/products error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Product with this slug already exists" });
    }
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PUT /api/products/:id
 *  Update an existing product
 * ────────────────────────────────────────── */
router.put("/:id", async (req, res) => {
  try {
    const updateData = req.body;

    // Re-generate slug if name changed
    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check slug uniqueness (exclude current product)
      const existingSlug = await Product.findOne({
        slug: updateData.slug,
        _id: { $ne: req.params.id },
      });
      if (existingSlug) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    // Update inStock
    if (updateData.stock !== undefined) {
      updateData.inStock = updateData.stock > 0;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("PUT /api/products/:id error:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  DELETE /api/products/:id
 *  Delete a product
 * ────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully", product });
  } catch (err) {
    console.error("DELETE /api/products/:id error:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

module.exports = router;
