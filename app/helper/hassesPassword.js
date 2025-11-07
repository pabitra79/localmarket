const bcrypt = require("bcryptjs");

const HasshedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (err) {
    console.error("Hashing error:", err);
    throw err;
  }
};

module.exports = HasshedPassword;
