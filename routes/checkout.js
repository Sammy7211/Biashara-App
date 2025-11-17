import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

// GET checkout page
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render("checkout", { cart, total });
});

// POST checkout (confirm purchase)
router.post("/", async (req, res) => {
  try {
    const cart = req.session.cart || [];

    if (!cart.length) {
      return res.status(400).send("Cart is empty");
    }

    // Extract submitted user info + address
    const { customerName, phone, fullAddress } = req.body;

    // ✅ Validate required fields
    if (!customerName?.trim() || !phone?.trim() || !fullAddress?.trim()) {
      return res.status(400).send("Name, phone, and full address are required");
    }

    // STOCK REDUCTION
    for (const item of cart) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).send(`Product not found: ${item.productId}`);
      }

      if (product.quantity < item.quantity) {
        return res.status(400).send(`Not enough stock for ${product.name}`);
      }

      product.quantity -= item.quantity;
      await product.save();
    }

    // CALCULATE TOTAL PRICE
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // SAVE ORDER TO MONGO
    const order = new Order({
      customerName,
      phone,
      fullAddress,
      cart: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })), // ✅ ensure cart items are stored cleanly
      totalPrice
    });

    await order.save();

    // CLEAR CART
    req.session.cart = [];

    res.render("order-success", { order });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).send("Error during checkout");
  }
});

export default router;
