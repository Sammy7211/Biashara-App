import express from "express";
import Product from "../models/Product.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public/images")); // save uploads in public/images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique filename
  }
});

const upload = multer({ storage });

// ===== Routes =====

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("products", { products });
  } catch (err) {
    res.send("Error fetching products");
  }
});

// GET add product form
router.get("/add", (req, res) => {
  res.render("add-product");
});

// POST add product with image upload
router.post("/add", upload.single("image"), async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !description || !price || !image) {
    return res.status(400).send("Missing required fields");
  }

  const product = new Product({ name, description, price, image });
  await product.save();
  res.redirect("/products");
});

export default router;
