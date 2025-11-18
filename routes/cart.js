import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add to cart
router.post("/add/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.send("Product not found");

  if (!req.session.cart) req.session.cart = [];

  const productId = product._id.toString();
  const requestedQty = parseInt(req.body.quantity || 1);

  // Check if product already in cart
  const existing = req.session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += requestedQty;
  } else {
    req.session.cart.push({
      productId,
      name: product.name,
      price: product.price,
      quantity: requestedQty
    });
  }

  // Stock check
  if (requestedQty > product.quantity) {
    return res.send("❌ Not enough stock available");
  }

  // Deduct stock immediately
  product.quantity -= requestedQty;
  await product.save();

  res.redirect("/cart");
});

// View cart
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render("cart", { cart, total });
});

// Remove from cart
router.get("/remove/:id", (req, res) => {
  const productId = req.params.id;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  }
  res.redirect("/cart");
});

// Update quantity
router.post("/cart/update/:id", (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  if (req.session.cart) {
    req.session.cart = req.session.cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: parseInt(quantity) };
      }
      return item;
    });
  }

  res.redirect("/cart");
});

export default router;
