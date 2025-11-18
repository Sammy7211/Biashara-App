import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add to cart
router.post("/add/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.send("Product not found");

  // Restriction: seller cannot buy their own product
  if (req.session.user.role === "seller" && product.sellerId.toString() === req.session.user.id) {
    return res.send("❌ Sellers cannot buy their own products");
  }
 const requestedQty = parseInt(req.body.quantity || 1);

  // Stock check
  if (requestedQty > product.quantity) {
    return res.send("❌ Not enough stock available");
  }

  // Deduct stock immediately
  product.quantity -= requestedQty;
  await product.save()


  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push({
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    quantity: requestedQty
  });

  res.redirect("/cart");
});


// View cart
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render("cart", { cart, total });
});

// Remove item
router.get("/cart/remove/:id", (req, res) => {
  req.session.cart = (req.session.cart || []).filter(i => i.id !== req.params.id);
  res.redirect("/cart");
});

// Update quantity
router.post("/cart/update/:id", (req, res) => {
  const { quantity } = req.body;

  req.session.cart = (req.session.cart || []).map(i => {
    if (i.id === req.params.id) i.quantity = parseInt(quantity);
    return i;
  });

  res.redirect("/cart");
});

export default router;
