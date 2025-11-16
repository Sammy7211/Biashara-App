import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render("checkout", { cart, total });
});

router.post("/", (req, res) => {
  // Clear the cart after checkout
  req.session.cart = [];
  res.render("order-success");
});

export default router;
