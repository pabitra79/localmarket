const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authCheck"); // Your auth middleware
const CartController = require("../controller/cartController");

// All cart routes require authentication
router.use(authCheck);

// Add item to cart
// POST /api/cart/add
router.post("/add", CartController.addToCart);

// Get user's cart items
// GET /api/cart
router.get("/", CartController.getCartItems);

// Get cart count
// GET /api/cart/count
router.get("/count", CartController.getCartCount);

// Update cart item quantity
// PUT /api/cart/:cartId
router.put("/:cartId", CartController.updateCartItem);

// Remove item from cart
// DELETE /api/cart/:cartId
router.delete("/:cartId", CartController.removeFromCart);

// Clear entire cart
// DELETE /api/cart/clear
router.delete("/clear", CartController.clearCart);

module.exports = router;
