const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
const Product = require("../models/Product");

/* ──────────────────────────────────────────
 *  GET /api/collections
 *  List all collections with product counts
 * ────────────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });

    // Get product counts per collection
    const counts = await Product.aggregate([
      { $match: { collection: { $ne: null } } },
      { $group: { _id: "$collection", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const result = collections.map((col) => {
      const obj = col.toJSON();
      obj.productCount = countMap[col._id.toString()] || 0;
      return obj;
    });

    res.json(result);
  } catch (err) {
    console.error("GET /api/collections error:", err);
    res.status(500).json({ message: "Failed to fetch collections", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  GET /api/collections/:id
 *  Get a single collection by ID
 * ────────────────────────────────────────── */
router.get("/:id", async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const productCount = await Product.countDocuments({ collection: collection._id });
    const obj = collection.toJSON();
    obj.productCount = productCount;

    res.json(obj);
  } catch (err) {
    console.error("GET /api/collections/:id error:", err);
    res.status(500).json({ message: "Failed to fetch collection", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  POST /api/collections
 *  Create a new collection
 * ────────────────────────────────────────── */
router.post("/", async (req, res) => {
  try {
    const { title, description, coverImage, isFeatured } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Collection title is required" });
    }

    // Auto-generate slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure slug uniqueness
    const existingSlug = await Collection.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const collection = new Collection({
      title: title.trim(),
      slug,
      description: description || "",
      coverImage: coverImage || "",
      isFeatured: isFeatured || false,
    });

    const saved = await collection.save();
    const obj = saved.toJSON();
    obj.productCount = 0;

    res.status(201).json(obj);
  } catch (err) {
    console.error("POST /api/collections error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "A collection with this title already exists" });
    }
    res.status(500).json({ message: "Failed to create collection", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  PUT /api/collections/:id
 *  Update an existing collection
 * ────────────────────────────────────────── */
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Re-generate slug if title changed
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check slug uniqueness (exclude current collection)
      const existingSlug = await Collection.findOne({
        slug: updateData.slug,
        _id: { $ne: req.params.id },
      });
      if (existingSlug) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    // Get old title before update (to sync product categories)
    const oldCollection = await Collection.findById(req.params.id);
    if (!oldCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    const oldTitle = oldCollection.title;

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    // If title changed, update all linked products' category field
    if (updateData.title && updateData.title !== oldTitle) {
      await Product.updateMany(
        { collection: req.params.id },
        { $set: { category: updateData.title.trim() } }
      );
    }

    const productCount = await Product.countDocuments({ collection: collection._id });
    const obj = collection.toJSON();
    obj.productCount = productCount;

    res.json(obj);
  } catch (err) {
    console.error("PUT /api/collections/:id error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "A collection with this title already exists" });
    }
    res.status(500).json({ message: "Failed to update collection", error: err.message });
  }
});

/* ──────────────────────────────────────────
 *  DELETE /api/collections/:id
 *  Delete a collection and unset it from linked products
 * ────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Unset the collection reference on linked products
    await Product.updateMany(
      { collection: req.params.id },
      { $set: { collection: null, category: "Uncategorized" } }
    );

    res.json({ message: "Collection deleted successfully", collection });
  } catch (err) {
    console.error("DELETE /api/collections/:id error:", err);
    res.status(500).json({ message: "Failed to delete collection", error: err.message });
  }
});

module.exports = router;
