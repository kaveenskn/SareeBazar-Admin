const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// ─── PUT /api/user/profile ───
router.put("/profile", protect, async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, phone, address },
    { new: true, runValidators: true }
  ).select("-password");
  res.json({ user });
});

module.exports = router;
