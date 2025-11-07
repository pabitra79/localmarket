const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const studentimage = multer({
  storage: storage,
});

module.exports = studentimage;
