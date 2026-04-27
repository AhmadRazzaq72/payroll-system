const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './auth.env' });

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  // ✅ Debug log
  console.log("🔍 AUTH HEADER:", req.headers.authorization);
  console.log("🔑 Token received:", token);

  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT Verification Failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
  