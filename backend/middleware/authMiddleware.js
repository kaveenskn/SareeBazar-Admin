const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // Read token from cookie OR Authorization header
  let token = req.cookies?.accessToken;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

module.exports = { protect };
