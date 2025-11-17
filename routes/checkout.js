import express from "express";
import Product from "../models/Product.js";

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

    // Reduce stock for each product in the cart
    for (let item of cart) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

      // Prevent overselling
      if (product.quantity < item.quantity) {
        return res.status(400).send(`Not enough stock for ${product.name}`);
      }

      product.quantity -= item.quantity;
      await product.save();
    }

    // Clear cart after successful checkout
    req.session.cart = [];

    res.render("order-success");
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).send("Error during checkout");
  }
});

export default router;
