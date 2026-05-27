const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId:          Number,
  slug:               String,
  name:               String,
  selectedColor:      String,
  selectedColorHex:   String,
  selectedColorImage: String,
  quantity:           Number,
  price:              Number,
  originalPrice:      Number,
  image:              String,
  category:           String,
  fabric:             String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, unique: true },
  items:   { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  shipping: {
    fullName:     String,
    email:        String,
    phone:        String,
    addressLine1: String,
    addressLine2: String,
    city:         String,
    state:        String,
    postalCode:   String,
    country:      String,
  },
  subtotal:      { type: Number, required: true },
  shippingFee:   { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  paymentId:     { type: String, default: "" },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded", "cod"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  cancelReason: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
