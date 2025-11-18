import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Add to cart
router.post("/add/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.send("Product not found");

  // Restriction: seller cannot buy their own product
  if (
    req.session.user &&
    req.session.user.role === "seller" &&
    product.sellerId.toString() === req.session.user.id
  ) {
    return res.send("❌ Sellers cannot buy their own products");
  }

  const requestedQty = Math.max(1, parseInt(req.body.quantity || 1));

  if (requestedQty > product.quantity) {
    return res.send("❌ Not enough stock available");
  }

  product.quantity -= requestedQty;
  await product.save();

  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push({
    productId: product._id.toString(), // ✅ consistent key
    name: product.name,
    price: product.price,
    quantity: requestedQty
  });

  res.redirect("/cart");
});

// View cart
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render("cart", { cart, total });
});

// Remove item
router.get("/remove/:id", (req, res) => {
  req.session.cart = (req.session.cart || []).filter(i => i.productId !== req.params.id);
  res.redirect("/cart");
});

// Update quantity
router.post("/update/:id", async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) return res.send("Product not found");

  const newQty = Math.max(1, parseInt(quantity));

  if (newQty > product.quantity + getCartItemQuantity(req.session.cart, productId)) {
    return res.send("❌ Not enough stock available to update quantity");
  }

  if (req.session.cart) {
    req.session.cart = req.session.cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
  }

  const currentCartQty = getCartItemQuantity(req.session.cart, productId);
  product.quantity = product.quantity + currentCartQty - newQty;
  await product.save();

  res.redirect("/cart");
});

function getCartItemQuantity(cart, productId) {
  const item = (cart || []).find(i => i.productId === productId);
  return item ? item.quantity : 0;
}

export default router;
