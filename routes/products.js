import express from "express";
import Product from "../models/Product.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // save uploads in /public/images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===== Seller dashboard =====
router.get("/seller-dashboard", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const products = await Product.find({ sellerId: req.session.user._id });
    const totalEarnings = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    res.render("seller-dashboard", {
      user: req.session.user,
      products,
      totalEarnings
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).send("Error loading dashboard");
  }
});

// ===== Add product form =====
router.get("/add", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("add-product", { user: req.session.user });
});

// ===== Handle product creation =====
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      image: req.file ? req.file.filename : null, // ✅ multer handles file
      sellerId: req.session.user._id
    });

    await newProduct.save();
    res.redirect("/products/seller-dashboard");
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).send("Error adding product");
  }
});

// ===== Product listing with filters =====
router.get("/", async (req, res) => {
  try {
    const { q, minPrice, maxPrice, category, sort } = req.query;
    const filter = {};

    if (q) filter.name = { $regex: q, $options: "i" };
    if (category && category !== "all") filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "priceAsc") sortOption = { price: 1 };
    if (sort === "priceDesc") sortOption = { price: -1 };
    if (sort === "nameAsc") sortOption = { name: 1 };
    if (sort === "nameDesc") sortOption = { name: -1 };

    const products = await Product.find(filter).sort(sortOption);

    res.render("products", {
      products,
      user: req.session.user || null,
      q,
      minPrice,
      maxPrice,
      category,
      sort,
      totalEarnings: null
    });
  } catch (err) {
    console.error("❌ Product fetch error:", err);
    res.status(500).send("Error loading products");
  }
});

export default router;