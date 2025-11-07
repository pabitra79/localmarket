const express = require("express");
const fs = require("fs");
const ProductmodelSchema = require("../model/productmodel");

class Productapi {
  async getProductData(req, res) {
    try {
      const data = await ProductmodelSchema.find({ status: "approved" });
      res.render("userdashboard", {
        success: true,
        message: "product found",
        user: data,
      });
    } catch (err) {
      console.log(err, "data not found");
      res.render("userdashboard", {
        success: false,
        message: "error fetching product data",
        Error: err.message,
      });
    }
  }

  async createProductData(req, res) {
    try {
      const { title, description, price, category } = req.body;
      const sellerId = req.user.id;

      if (!title || !description || !price || !category) {
        return res.render("addproduct", {
          success: false,
          message: "All fields are required",
          user: req.user,
        });
      }

      const newdata = new ProductmodelSchema({
        title,
        description,
        price,
        seller: sellerId,
        category,
        image: req.file
          ? `uploads/${req.file.filename}`
          : "uploads/default.png",
      });

      await newdata.save();

      // Redirect with success message instead of rendering
      req.flash("success", "Product created successfully!");
      res.redirect("/userdashboard");
    } catch (err) {
      console.log(err);
      res.render("addproduct", {
        success: false,
        message: "Product creation failed: " + err.message,
        user: req.user,
      });
    }
  }
  async updateProductfor(req, res) {
    try {
      const id = req.params.id;
      const editdata = await ProductmodelSchema.findById(id);
      res.render("updateproducte", {
        title: "edit page",
        product: editdata,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/userdashboard");
    }
  }
  async updateProduct(req, res) {
    try {
      const id = req.params.id;
      const { title, description, price, category } = req.body;

      const currentProduct = await ProductmodelSchema.findById(id);
      if (!currentProduct) {
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error(e);
          }
        }
        return res.redirect("/userdashboard");
      }

      const updateData = { title, price, category, description };
      const oldImagePath = currentProduct.image;

      if (req.file) {
        // if old image is not used by other products, delete it
        if (oldImagePath) {
          const otherProduct = await ProductmodelSchema.findOne({
            _id: { $ne: id },
            image: oldImagePath,
          });
          if (!otherProduct && fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (e) {
              console.error(e);
            }
          }
        }
        updateData.image = req.file.path;
      } else {
        updateData.image = oldImagePath;
      }

      const updatedata = await ProductmodelSchema.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (updatedata) {
        return res.redirect("/userdashboard");
      } else {
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error(e);
          }
        }
        return res.redirect("/userdashboard");
      }
    } catch (err) {
      console.log(err, "Error in updateProduct");
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error(e);
        }
      }
      return res.redirect("/userdashboard");
    }
  }

  async deleteProduct(req, res) {
    try {
      const id = req.params.id;
      const data = await ProductmodelSchema.findById(id);

      if (!data) {
        return res.redirect("/userdashboard");
      }

      if (data.image) {
        // Check if another product is using the same image
        const otherProduct = await ProductmodelSchema.findOne({
          _id: { $ne: id }, // exclude the current product
          image: data.image,
        });

        if (!otherProduct && fs.existsSync(data.image)) {
          try {
            fs.unlinkSync(data.image); // only delete if unused
          } catch (unlinkError) {
            console.error("Error deleting image file:", unlinkError);
          }
        }
      }

      await ProductmodelSchema.findByIdAndDelete(id);
      res.redirect("/userdashboard");
    } catch (err) {
      console.log(err, "Error in deleteProduct");
      res.redirect("/userdashboard");
    }
  }
}

const productUserApi = new Productapi();
module.exports = productUserApi;
