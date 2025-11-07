const express = require("express");
const jwt = require("jsonwebtoken");
const authmodelSchema = require("../model/authSchema");
const ProductmodelShema = require("../controller/productcontroller");
const ProductModel = require("../model/productmodel");
const HasshedPassword = require("../helper/hassesPassword");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");

class authControllerApi {
  async homepage(req, res) {
    try {
      const products = await ProductModel.aggregate([
        { $match: { status: "approved" } },
        {
          $lookup: {
            from: "localmarketauthroles",
            localField: "seller",
            foreignField: "_id",
            as: "sellerDetails",
          },
        },
        { $unwind: "$sellerDetails" },
        {
          $project: {
            title: 1,
            description: 1,
            price: 1,
            image: 1,
            category: 1,
            "sellerDetails.name": 1,
            "sellerDetails.email": 1,
            "sellerDetails.phone": 1,
          },
        },
      ]);

      console.log("product found for homepage", products.length);

      res.render("home", {
        user: req.user || null,
        title: "home page",
        products,
        shownavbar: true,
      });
    } catch (err) {
      console.log(err);
      res.render("home", {
        user: req.user || null,
        title: "Home Page",
        products: [],
      });
    }
  }

  // Add the missing checkAuth method
  async checkAuth(req, res, next) {
    try {
      if (req.user) {
        next();
      } else {
        req.flash("error", "Please login to access this page");
        return res.redirect("/login");
      }
    } catch (err) {
      console.log("CheckAuth Error:", err);
      req.flash("error", "Authentication error");
      return res.redirect("/login");
    }
  }

  // register page
  async register(req, res) {
    res.render("register", {
      title: "User Register",
      error: req.flash("error"),
      success: req.flash("success"),
      shownavbar: true,
    });
  }

  // handle register submit
  async registerCreate(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !phone || !password) {
        req.flash("error", "All fields are required");
        return res.redirect("/register");
      }

      const existingdata = await authmodelSchema.findOne({ email });
      if (existingdata) {
        req.flash("error", "User already exists. Please login");
        return res.redirect("/login");
      }

      const hashed = await HasshedPassword(password);

      const newdata = new authmodelSchema({
        name,
        email,
        phone,
        password: hashed,
        role: "user", // default role
      });

      await newdata.save();
      req.flash("success", "Registration successful, please login");
      return res.redirect("/login");
    } catch (err) {
      console.log("Error:", err);
      req.flash("error", "Server error, please try again");
      return res.redirect("/register");
    }
  }

  // login page
  async login(req, res) {
    res.render("login", {
      title: "User Login",
      error: req.flash("error"),
      success: req.flash("success"),
      shownavbar: true,
    });
  }

  // handle login submit - FIXED
  // CORRECTED loginCreate method - Replace in your controller
  async loginCreate(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "All fields are required");
        return res.redirect("/login");
      }

      const data = await authmodelSchema.findOne({ email });
      if (!data) {
        req.flash("error", "User not found, please register");
        return res.redirect("/register");
      }

      const isPasswordMatch = await bcrypt.compare(password, data.password);
      if (!isPasswordMatch) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }

      const token = jwt.sign(
        {
          id: data._id,
          email: data.email,
          role: data.role,
          name: data.name,
        },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        { expiresIn: "60m" }
      );

      // FIXED: Proper redirect logic for both admin and user
      if (data.role === "admin") {
        res.clearCookie("adminToken");
        res.cookie("adminToken", token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 1000,
          path: "/",
          sameSite: "Strict",
        });
        req.flash("success", "Admin Login Successful");
        // console.log("Admin login successful, token created:", token);
        return res.redirect("/admindashboard");
      } else {
        res.clearCookie("userToken"); // Clear any existing token
        res.cookie("userToken", token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 1000,
          path: "/",
          sameSite: "lax",
        });
        req.flash("success", "User Login Successful");
        // console.log("User login successful, token created:", token);
        return res.redirect("/userdashboard");
      }
    } catch (err) {
      console.log("Login Error:", err);
      req.flash("error", "Something went wrong");
      return res.redirect("/login");
    }
  }

  // FIXED: Using req.user instead of req.data
  async userdashboard(req, res) {
    try {
      const userProduct = await ProductModel.find({ seller: req.user.id });
      // console.log("User dashboard - req.user:", req.user);
      console.log("user product found", userProduct.length);

      res.render("userdashboard", {
        title: "User Dashboard",
        sucess: req.flash("sucess"),
        products: userProduct,
        user: req.user, // FIXED: Changed from req.data to req.user
        shownavbar: false,
      });
    } catch (err) {
      console.log(err);
      res.render("userdashboard", {
        user: req.user,
        products: [],
      });
    }
  }

  // New method - product detail page
  async productDetail(req, res) {
    try {
      const productId = req.params.id;
      const product = await ProductModel.findById(
        productId,
        "seller",
        "name email phone"
      );

      if (!product) {
        return res.status(404).render("error", {
          message: "Product not found",
          user: req.user || null,
        });
      }

      res.render("productdetail", {
        product: product,
        user: req.user || null,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(500).render("error", {
        message: "Error loading product details",
        user: req.user || null,
      });
    }
  }
  // FIXED: Using req.user instead of req.data
  async admindashboard(req, res) {
    try {
      // console.log("Admin dashboard - req.user:", req.user);
      res.render("admindashboard", {
        title: "Admin Dashboard",
        user: req.user, // FIXED: Changed from req.data to req.user
        shownavbar: false,
      });
    } catch (err) {
      console.log(err);
      req.flash("error", "An error occurred");
    }
  }
  // logout for admin and user
  async adminlogout(req, res) {
    try {
      res.clearCookie("adminToken", {
        path: "/",
        sameSite: "Strict",
      });
      req.flash("success", "Admin logout successful");
      return res.redirect("/login"); // FIXED: Added redirect
    } catch (err) {
      console.log(err, "Logout failed");
      req.flash("error", "Logout failed");
      return res.redirect("/login");
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie("userToken", {
        path: "/",
        sameSite: "Strict",
      });
      req.flash("success", "User logout successful");
      return res.redirect("/login"); // FIXED: Added redirect
    } catch (err) {
      console.log(err, "Logout failed");
      req.flash("error", "Logout failed");
      return res.redirect("/login");
    }
  }
}

module.exports = new authControllerApi();
