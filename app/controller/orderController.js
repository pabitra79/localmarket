const Order = require("../model/orderSchema");
const Cart = require("../model/cartSchema");
const Product = require("../model/productmodel");

// Create order from cart
class OrderController {
  async createOrder(req, res) {
    try {
      const { shippingAddress, paymentMethod = "cod" } = req.body;
      const userId = req.user.id;

      // Validate shipping address
      if (
        !shippingAddress ||
        !shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.zipCode ||
        !shippingAddress.phone
      ) {
        return res.status(400).json({
          success: false,
          message: "Complete shipping address is required",
        });
      }

      // Get cart items
      const cartItems = await Cart.find({ user: userId })
        .populate("product")
        .populate({
          path: "product",
          populate: {
            path: "seller",
          },
        });

      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }

      // Prepare order items
      const orderItems = [];
      let totalAmount = 0;

      for (const cartItem of cartItems) {
        if (!cartItem.product) {
          continue; // Skip deleted products
        }

        const orderItem = {
          product: cartItem.product._id,
          seller: cartItem.product.seller._id,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
          productTitle: cartItem.product.title,
          productImage: cartItem.product.image,
        };

        orderItems.push(orderItem);
        totalAmount += cartItem.product.price * cartItem.quantity;
      }

      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid items in cart",
        });
      }

      // Create order
      const order = new Order({
        buyer: userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
      });

      const savedOrder = await order.save();

      // Clear cart after successful order
      await Cart.deleteMany({ user: userId });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          orderId: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          totalAmount: savedOrder.totalAmount,
          status: savedOrder.status,
        },
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: error.message,
      });
    }
  }

  // Get user's orders (for buyers)
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const orders = await Order.find({ buyer: userId })
        .populate({
          path: "items.product",
          select: "title image",
        })
        .populate({
          path: "items.seller",
          select: "name email",
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalOrders = await Order.countDocuments({ buyer: userId });

      res.json({
        success: true,
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }

  // Get seller's orders (for sellers to see what was ordered from them)
  async getSellerOrders(req, res) {
    try {
      const sellerId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      // Build query
      let matchQuery = { "items.seller": sellerId };
      if (status) {
        matchQuery.status = status;
      }

      const orders = await Order.find(matchQuery)
        .populate({
          path: "buyer",
          select: "name email",
        })
        .populate({
          path: "items.product",
          select: "title image",
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Filter items to show only seller's products
      const filteredOrders = orders.map((order) => ({
        ...order.toObject(),
        items: order.items.filter(
          (item) => item.seller.toString() === sellerId.toString()
        ),
      }));

      const totalOrders = await Order.countDocuments(matchQuery);

      res.json({
        success: true,
        orders: filteredOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get seller orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seller orders",
        error: error.message,
      });
    }
  }

  // Get single order details
  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId)
        .populate({
          path: "buyer",
          select: "name email",
        })
        .populate({
          path: "items.product",
          select: "title image description",
        })
        .populate({
          path: "items.seller",
          select: "name email",
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user is buyer or seller
      const isBuyer = order.buyer._id.toString() === userId.toString();
      const isSeller = order.items.some(
        (item) => item.seller._id.toString() === userId.toString()
      );

      if (!isBuyer && !isSeller) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      console.error("Get order by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order details",
        error: error.message,
      });
    }
  }

  // Update order status (for sellers)
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const sellerId = req.user.id;

      const validStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if seller has items in this order
      const hasSellerItems = order.items.some(
        (item) => item.seller.toString() === sellerId.toString()
      );

      if (!hasSellerItems) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      order.status = status;
      const updatedOrder = await order.save();

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message,
      });
    }
  }

  // Cancel order (for buyers, only if status is pending)
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user is the buyer
      if (order.buyer.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check if order can be cancelled
      if (order.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Order cannot be cancelled at this stage",
        });
      }

      order.status = "cancelled";
      const updatedOrder = await order.save();

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  }
}

module.exports = new OrderController();
