const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// ─── PUT /api/user/profile ───
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, address, email, password } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (email) user.email = email;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();
    
    const updatedUser = await User.findById(req.userId).select("-password");
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
