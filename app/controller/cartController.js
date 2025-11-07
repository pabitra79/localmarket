const Cart = require("../model/cartSchema");
const Product = require("../model/productmodel"); // Your existing product model

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check if product exists and is not user's own product
    const product = await Product.findById(productId).populate("seller");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user is trying to add their own product
    if (product.seller._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add your own product to cart",
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      user: userId,
      product: productId,
    });

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += parseInt(quantity);
      await existingCartItem.save();

      return res.json({
        success: true,
        message: "Cart updated successfully",
        data: existingCartItem,
      });
    } else {
      // Create new cart item
      const cartItem = new Cart({
        user: userId,
        product: productId,
        quantity: parseInt(quantity),
      });

      const savedCartItem = await cartItem.save();

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: savedCartItem,
      });
    }
  } catch (error) {
    console.error("Add to cart error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Item already exists in cart",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// Get user's cart items
const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.find({ user: userId })
      .populate({
        path: "product",
        populate: {
          path: "seller",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out items where product might be deleted
    const validCartItems = cartItems.filter((item) => item.product);

    // Remove invalid cart items from database
    const invalidItemIds = cartItems
      .filter((item) => !item.product)
      .map((item) => item._id);

    if (invalidItemIds.length > 0) {
      await Cart.deleteMany({ _id: { $in: invalidItemIds } });
    }

    // Format response
    const formattedItems = validCartItems.map((item) => ({
      cart_id: item._id,
      quantity: item.quantity,
      product_id: item.product._id,
      name: item.product.title,
      price: item.product.price,
      image: item.product.image,
      description: item.product.description,
      seller_name: item.product.seller.name,
      seller_id: item.product.seller._id,
      subtotal: item.product.price * item.quantity,
    }));

    const totalAmount = formattedItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    res.json({
      success: true,
      cartItems: formattedItems,
      totalAmount: totalAmount,
      itemCount: formattedItems.length,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart items",
      error: error.message,
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const cartItem = await Cart.findOne({
      _id: cartId,
      user: userId,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    cartItem.quantity = parseInt(quantity);
    const updatedCartItem = await cartItem.save();

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedCartItem,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const userId = req.user.id;

    const result = await Cart.findOneAndDelete({
      _id: cartId,
      user: userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// Get cart count
const getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Cart.countDocuments({ user: userId });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get cart count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart count",
      error: error.message,
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Cart.deleteMany({ user: userId });

    res.json({
      success: true,
      message: `Cart cleared successfully. ${result.deletedCount} items removed.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
  getCartCount,
  clearCart,
};
