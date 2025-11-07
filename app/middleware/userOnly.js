const jwt = require("jsonwebtoken");

const userOnly = (req, res, next) => {
  const { userToken } = req.cookies || {};
  const secret = process.env.JWT_SECRET || "your_jwt_secret_key";

  if (!userToken) {
    console.log("No user token found, redirecting to login");
    return res.redirect("/login");
  }

  jwt.verify(userToken, secret, (err, decoded) => {
    if (err) {
      console.log("User token verification error:", err.message);
      res.clearCookie("userToken"); // FIXED: clearCookie, not clearCookies
      return res.redirect("/login");
    }

    // FIXED: Should be !== "user", not === !"user"
    if (decoded.role !== "user") {
      console.log("Not a user role, redirecting to login");
      return res.redirect("/login");
    }

    console.log("User authenticated successfully:", decoded);
    req.user = decoded; // Set user data for controllers
    next();
  });
};

module.exports = userOnly;
