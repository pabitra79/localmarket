// app/model/orderSchema.js
const mongoose = require("mongoose");
const cartSchema = require("./cartSchema"); // Import the schema

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Localmarketauthrole",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "localmarketproduct",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Localmarketauthrole",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("localmarketorder", orderSchema);
const Cart = mongoose.model("localmarketcart", cartSchema);

module.exports = { Cart, Order };
