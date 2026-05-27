const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected successfully | Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (err) {
    console.error(`❌ MongoDB connection FAILED: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
