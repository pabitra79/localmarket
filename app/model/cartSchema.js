// app/model/cartSchema.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Localmarketauthrole",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "localmarketproduct",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = cartSchema;
