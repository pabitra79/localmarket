const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authCheck"); // Your auth middleware
const {
  createOrder,
  getUserOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controller/orderController");

// All order routes require authentication
router.use(authCheck);

// Create order from cart
// POST /api/orders
router.post("/", createOrder);

// Get user's orders (buyer's perspective)
// GET /api/orders/my-orders
router.get("/my-orders", getUserOrders);

// Get seller's orders (seller's perspective)
// GET /api/orders/seller-orders
router.get("/seller-orders", getSellerOrders);

// Get single order details
// GET /api/orders/:orderId
router.get("/:orderId", getOrderById);

// Update order status (for sellers)
// PUT /api/orders/:orderId/status
router.put("/:orderId/status", updateOrderStatus);

// Cancel order (for buyers)
// PUT /api/orders/:orderId/cancel
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;
