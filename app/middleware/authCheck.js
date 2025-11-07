const jwt = require("jsonwebtoken");

const authCheck = (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET || "your_jwt_secret_key";
    const { adminToken, userToken } = req.cookies || {};

    req.admin = null;
    req.user = null;

    // Check adminToken first
    if (adminToken) {
      try {
        const decodedAdmin = jwt.verify(adminToken, secret);
        if (decodedAdmin.role === "admin") {
          req.admin = decodedAdmin;
        }
      } catch (e) {
        console.log("Admin token verification error:", e.message);
        res.clearCookie("adminToken", { path: "/" });
      }
    }

    // Check userToken
    if (userToken) {
      try {
        const decodedUser = jwt.verify(userToken, secret);
        if (decodedUser.role === "user") {
          req.user = decodedUser;
        }
      } catch (e) {
        console.log("User token verification error:", e.message); // FIXED: Should say "User token"
        res.clearCookie("userToken", { path: "/" }); // FIXED: Should clear userToken, not adminToken
      }
    }

    return next();
  } catch (err) {
    console.log("Auth check middleware error:", err);
    return next();
  }
};

module.exports = authCheck;
