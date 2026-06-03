const express = require("express");
const router = express.Router();
const ShopInfo = require("../models/ShopInfo");

// GET /api/shop-info — Public: fetch shop info for display
router.get("/", async (req, res) => {
  try {
    // Always use the single shop info document (singleton pattern)
    let shopInfo = await ShopInfo.findOne();
    if (!shopInfo) {
      // Create default if none exists
      shopInfo = await ShopInfo.create({});
    }
    res.json(shopInfo);
  } catch (error) {
    console.error("Error fetching shop info:", error);
    res.status(500).json({ message: "Failed to fetch shop info" });
  }
});

// PUT /api/shop-info — Admin: update shop info
router.put("/", async (req, res) => {
  try {
    const {
      storeName,
      supportEmail,
      phone,
      address,
      openingHours,
      tagline,
      description,
      socialLinks,
    } = req.body;

    let shopInfo = await ShopInfo.findOne();
    if (!shopInfo) {
      shopInfo = new ShopInfo({});
    }

    // Update only fields that are provided
    if (storeName !== undefined) shopInfo.storeName = storeName;
    if (supportEmail !== undefined) shopInfo.supportEmail = supportEmail;
    if (phone !== undefined) shopInfo.phone = phone;
    if (address !== undefined) shopInfo.address = address;
    if (openingHours !== undefined) shopInfo.openingHours = openingHours;
    if (tagline !== undefined) shopInfo.tagline = tagline;
    if (description !== undefined) shopInfo.description = description;
    if (socialLinks !== undefined) shopInfo.socialLinks = socialLinks;

    await shopInfo.save();
    res.json({ message: "Shop info updated successfully", shopInfo });
  } catch (error) {
    console.error("Error updating shop info:", error);
    res.status(500).json({ message: "Failed to update shop info" });
  }
});

module.exports = router;
