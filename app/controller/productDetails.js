const express = require("express");
const Product = require("../model/productmodel");
const AuthUser = require("../model/authSchema");
const mongoose = require("mongoose");

class ProdcutDetails {
  async ProductsDetailsWIthID(req, res) {
    try {
      const productId = req.params.id;
      const productResult = await Product.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(productId) },
        },
        {
          $lookup: {
            from: "localmarketauthroles",
            localField: "seller",
            foreignField: "_id",
            as: "sellerDetails",
          },
        },
        {
          $unwind: {
            path: "$sellerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            price: 1,
            category: 1,
            image: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            "sellerDetails.name": 1,
            "sellerDetails.email": 1,
            "sellerDetails.phone": 1,
            "sellerDetails._id": 1,
            "sellerDetails.role": 1,
          },
        },
      ]);

      //   its for prodcuct length
      if (!productResult || !productResult.length === 0) {
        return res.status(404).render("error", {
          message: "product not found",
          error: { status: 404 },
        });
      }
      const product = productResult[0];
      // only show the product if approved
      if (product.status !== "approved") {
        return res.status(404).render("error", {
          message: "Product not available",
          error: { status: 404 },
        });
      }

      res.render("productDetails", {
        product: product,
        title: `${product.title}-Product Details`,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = new ProdcutDetails();
