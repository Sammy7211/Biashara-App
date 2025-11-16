import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    console.log("✅ Products fetched:", products);
    res.render("products", { products });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.send("Error fetching products");
  }
});

// GET add product form
router.get("/add", (req, res) => {
  res.render("add-product");
});

// POST add product
router.post("/add", async (req, res) => {
  const { name, description, price, image } = req.body;
  const product = new Product({ name, description, price, image });
  await product.save();
  res.redirect("/products");
});

export default router;
