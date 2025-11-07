const jwt = require("jsonwebtoken");

const adminOnly = (req, res, next) => {
  const { adminToken } = req.cookies || {}; // FIXED: Should be adminToken, not adminOnly
  const secret = process.env.JWT_SECRET || "your_jwt_secret_key";

  if (!adminToken) {
    // FIXED: Check adminToken
    console.log("No admin token found, redirect to login");
    return res.redirect("/login");
  }

  // FIXED: Proper jwt.verify syntax
  jwt.verify(adminToken, secret, (err, decoded) => {
    if (err) {
      console.log("Admin token verification error:", err.message);
      res.clearCookie("adminToken"); // FIXED: clearCookie, not clearCookies
      return res.redirect("/login");
    }

    // FIXED: Should be !== "admin", not === !"admin"
    if (decoded.role !== "admin") {
      console.log("Not an admin, redirecting to login");
      return res.redirect("/login");
    }

    console.log("Admin authenticated successfully:", decoded);
    req.user = decoded; // Use req.user to stay consistent
    next();
  });
};

module.exports = adminOnly;
