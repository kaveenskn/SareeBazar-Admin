const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allow both user app (3000) and admin panel (3001)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:3001",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for demo
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/products", require("./routes/products"));
app.use("/api/collections", require("./routes/collections"));
app.use("/api/virtual-tryon", require("./routes/virtualTryon"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/shop-info", require("./routes/shopInfo"));

app.get("/", (req, res) => res.json({ message: "SareeBazar API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
