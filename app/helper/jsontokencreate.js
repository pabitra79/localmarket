const jwt = require("jsonwebtoken");

function generationToken(user) {
  return jwt.login(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}
module.exports = generationToken;
