const express = require("express");
const router = express.Router();
const AuthControllerApi = require("../controller/authcontrollerapi"); // fixed case
const Auth = require("../middleware/authCheck");
const userOnly = require("../middleware/userOnly");
const adminOnly = require("../middleware/adminOnly");

// Public routes
router.get("/", AuthControllerApi.homepage);
router.get("/login", AuthControllerApi.login);
router.post("/login/create", AuthControllerApi.loginCreate);
router.get("/register", AuthControllerApi.register);
router.post("/register/create", AuthControllerApi.registerCreate);

router.get(
  "/userdashboard",
  userOnly,
  // AuthControllerApi.checkAuth,
  AuthControllerApi.userdashboard // fixed
);
router.get(
  "/admindashboard",
  adminOnly,
  // AuthControllerApi.checkAuth,
  AuthControllerApi.admindashboard
);
router.get("/logout", AuthControllerApi.logout);
router.get("adminlogout", AuthControllerApi.adminlogout);

module.exports = router;
