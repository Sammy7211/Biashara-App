import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add to cart (POST)
router.post("/add/:id", async (req, res) => {
  const productId = req.params.id;
  const quantity = parseInt(req.body.quantity) || 1;

  const product = await Product.findById(productId);
  if (!product) return res.send("Product not found");

  if (!req.session.cart) req.session.cart = [];

  // Check if product already in cart
  const existing = req.session.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    req.session.cart.push({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      quantity: quantity
    });
  }

  res.redirect("/cart");
});

// View cart
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render("cart", { cart, total });
});

// Remove from cart
router.get("/remove/:id", (req, res) => {
  const productId = req.params.id;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.id !== productId);
  }
  res.redirect("/cart");
});

// Update quantity
router.post("/update/:id", (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  if (req.session.cart) {
    req.session.cart = req.session.cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: parseInt(quantity) };
      }
      return item;
    });
  }

  res.redirect("/cart");
});

export default router;
