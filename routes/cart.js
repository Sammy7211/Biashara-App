import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add to cart
router.post("/add/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.send("Product not found");

<<<<<<< HEAD
  // Restriction: seller cannot buy their own product
  if (req.session.user.role === "seller" && product.sellerId.toString() === req.session.user.id) {
    return res.send("❌ Sellers cannot buy their own products");
=======
  if (!req.session.cart) req.session.cart = [];

  // Check if product already in cart
  const existing = req.session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    req.session.cart.push({
      productId: product._id.toString(),   // ✅ consistent key
      name: product.name,
      price: product.price,
      quantity: quantity
    });
>>>>>>> 55bf53852afa8c7bc11cd0d966ed30bb960de6d5
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

  req.session.cart = req.session.cart; // ensure session updated
  res.redirect("/cart");
});


// View cart
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render("cart", { cart, total });
});

<<<<<<< HEAD
// Remove item
router.get("/cart/remove/:id", (req, res) => {
  req.session.cart = (req.session.cart || []).filter(i => i.id !== req.params.id);
=======
// Remove from cart
router.get("/remove/:id", (req, res) => {
  const productId = req.params.id;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  }
>>>>>>> 55bf53852afa8c7bc11cd0d966ed30bb960de6d5
  res.redirect("/cart");
});

// Update quantity
router.post("/cart/update/:id", (req, res) => {
  const { quantity } = req.body;

<<<<<<< HEAD
  req.session.cart = (req.session.cart || []).map(i => {
    if (i.id === req.params.id) i.quantity = parseInt(quantity);
    return i;
  });
=======
  if (req.session.cart) {
    req.session.cart = req.session.cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: parseInt(quantity) };
      }
      return item;
    });
  }
>>>>>>> 55bf53852afa8c7bc11cd0d966ed30bb960de6d5

  res.redirect("/cart");
});

export default router;
