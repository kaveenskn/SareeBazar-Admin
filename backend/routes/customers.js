const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const router = express.Router();

// ─── GET /api/customers/admin/all ─── (admin: all customers with purchase data)
router.get("/admin/all", async (req, res) => {
  try {
    // Get all orders with user populated
    const orders = await Order.find()
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });

    // Group orders by user
    const customerMap = new Map();

    for (const order of orders) {
      if (!order.user) continue;

      const userId = order.user._id.toString();

      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          _id: userId,
          name: order.user.name || order.shipping.fullName,
          email: order.user.email || order.shipping.email,
          phone: order.user.phone || order.shipping.phone || "",
          city: order.shipping.city || order.user.address?.city || "",
          state: order.shipping.state || order.user.address?.state || "",
          totalOrders: 0,
          lifetimeSpend: 0,
          orders: [],
          lastOrderDate: null,
          firstOrderDate: null,
        });
      }

      const customer = customerMap.get(userId);
      customer.totalOrders += 1;
      customer.lifetimeSpend += order.total || 0;

      const orderDate = new Date(order.createdAt);
      if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
      }
      if (!customer.firstOrderDate || orderDate < customer.firstOrderDate) {
        customer.firstOrderDate = orderDate;
      }

      // Add order summary
      customer.orders.push({
        orderId: order.orderId,
        items: order.items.map((item) => ({
          name: item.name,
          selectedColor: item.selectedColor,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          category: item.category,
          fabric: item.fabric,
        })),
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      });
    }

    // Convert map to array and calculate membership tiers
    const customers = Array.from(customerMap.values()).map((customer) => {
      let tier = "Silver";
      if (customer.lifetimeSpend >= 50000 || customer.totalOrders >= 10) {
        tier = "VIP";
      } else if (customer.lifetimeSpend >= 20000 || customer.totalOrders >= 5) {
        tier = "Gold";
      }
      return { ...customer, tier };
    });

    // Sort by lifetime spend descending
    customers.sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);

    // Calculate aggregate stats
    const totalCustomers = customers.length;
    const vipMembers = customers.filter((c) => c.tier === "VIP").length;
    const repeatCustomers = customers.filter((c) => c.totalOrders > 1).length;
    const repeatRate =
      totalCustomers > 0
        ? Math.round((repeatCustomers / totalCustomers) * 100)
        : 0;
    const avgLTV =
      totalCustomers > 0
        ? Math.round(
            customers.reduce((sum, c) => sum + c.lifetimeSpend, 0) /
              totalCustomers
          )
        : 0;

    res.json({
      customers,
      stats: {
        totalCustomers,
        vipMembers,
        repeatRate,
        avgLTV,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch customers", error: err.message });
  }
});

module.exports = router;
