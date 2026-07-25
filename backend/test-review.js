require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("./models/Review");
const Product = require("./models/Product");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const user = await User.findOne();
    const product = await Product.findOne();
    if (!user || !product) {
      console.log("No user or product found");
      process.exit(0);
    }
    
    console.log(`Creating review for user ${user._id} and product ${product._id}`);
    
    const review = await Review.create({
      user: user._id,
      product: product._id,
      rating: 5,
      title: "Test",
      comment: "This is a test review",
      isVerifiedPurchase: false,
    });
    
    console.log("Review created successfully:", review);
  } catch (err) {
    console.error("Error creating review:", err);
  } finally {
    process.exit(0);
  }
});
