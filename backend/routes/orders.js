const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// ─── POST /api/orders ─── (place order)
router.post("/", protect, async (req, res) => {
  try {
    const { items, shipping, subtotal, shippingFee, discount, total, paymentId, paymentMethod, paymentStatus } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }
    if (!shipping || !shipping.fullName || !shipping.addressLine1 || !shipping.city) {
      return res.status(400).json({ message: "Shipping address is incomplete" });
    }
    if (!total || !paymentMethod) {
      return res.status(400).json({ message: "Total and payment method are required" });
    }

    // Generate unique order ID
    const orderId = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Determine payment status
    let resolvedPaymentStatus = paymentStatus || "pending";
    if (paymentMethod.toLowerCase() === "cash on delivery" || paymentMethod.toLowerCase() === "cod") {
      resolvedPaymentStatus = "cod";
    } else if (paymentId) {
      // If a paymentId is provided, the payment gateway confirmed it
      resolvedPaymentStatus = "paid";
    }

    // Set order status based on payment
    const orderStatus = resolvedPaymentStatus === "paid" || resolvedPaymentStatus === "cod"
      ? "confirmed"
      : "pending";

    const order = await Order.create({
      user: req.userId,
      orderId,
      items,
      shipping,
      subtotal: subtotal || 0,
      shippingFee: shippingFee || 0,
      discount: discount || 0,
      total,
      paymentId: paymentId || "",
      paymentMethod,
      paymentStatus: resolvedPaymentStatus,
      status: orderStatus,
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
});

// ─── GET /api/orders/admin/all ─── (admin: all orders, no auth for demo)
router.get("/admin/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

// ─── PATCH /api/orders/admin/:orderId/status ─── (admin: update order status)
router.patch("/admin/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { returnDocument: "after" }
    ).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
});

// ─── GET /api/orders ─── (user's orders)
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

// ─── GET /api/orders/all ─── Get all orders (admin)
router.get("/all", protect, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET /api/orders/:orderId ───
router.get("/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.userId });
    if (!order) {
      // Try finding by internal _id for admin panel
      const adminOrder = await Order.findById(req.params.orderId).populate("user", "name email");
      if (adminOrder) return res.json(adminOrder);
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
});

// ─── PUT /api/orders/:id/status ─── Update order status (admin)
router.put("/:id/status", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status || order.status;
    if (req.body.status === "Delivered") order.deliveredAt = Date.now();

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PATCH /api/orders/:orderId/payment ─── (update payment status after gateway callback)
router.patch("/:orderId/payment", protect, async (req, res) => {
  try {
    const { paymentId, paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ message: "paymentStatus is required" });
    }

    const update = { paymentStatus };
    if (paymentId) update.paymentId = paymentId;

    // Auto-confirm order when payment succeeds
    if (paymentStatus === "paid") {
      update.status = "confirmed";
    }
    // Cancel order if payment failed
    if (paymentStatus === "failed") {
      update.status = "cancelled";
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, user: req.userId },
      update,
      { returnDocument: "after" }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment", error: err.message });
  }
});

// ─── PATCH /api/orders/:orderId/cancel ─── (User cancels an order)
router.patch("/:orderId/cancel", protect, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Cancellation reason is required" });
    }

    const order = await Order.findOne({ orderId: req.params.orderId, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Order cannot be cancelled because it is already ${order.status}` });
    }

    order.status = "cancelled";
    order.cancelReason = reason;
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
});

module.exports = router;
