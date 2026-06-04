const mongoose = require("mongoose");

const shopInfoSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "SareeBazar",
    },
    supportEmail: {
      type: String,
      default: "support@sareebazar.lk",
    },
    phone: {
      type: String,
      default: "+94 77 123 4567",
    },
    address: {
      type: String,
      default: "No. 25, Main Street, Colombo, Sri Lanka",
    },
    openingHours: {
      type: String,
      default: "Mon – Sat : 9.00 AM – 8.00 PM",
    },
    tagline: {
      type: String,
      default: "Elegance in every thread.",
    },
    description: {
      type: String,
      default:
        "Weaving tradition into modern elegance. Discover handpicked, premium sarees crafted for the contemporary woman.",
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    shippingCosts: {
      cardPayment: { type: Number, default: 0 },
      cashOnDelivery: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShopInfo", shopInfoSchema);
