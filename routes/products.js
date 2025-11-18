import express from "express";
import Product from "../models/Product.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// View all products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.render("products", { 
    products,
  user: req.session.user || null
 });
});

// Add product form
router.get("/add", (req, res) => {
    console.log("Session user:", req.session.user); 
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Only sellers can add products");
  }
  res.render("add-product");
});

// Add product
router.post("/add", upload.single("image"), async (req, res) => {
  if (!req.session.user) return res.send("Unauthorized");

  const { name, description, price, quantity } = req.body;

  const product = new Product({
    name,
    description,
    price,
    quantity,
    image: req.file.filename,
    sellerId: req.session.user.id   // NEW
  });

  await product.save();
  res.redirect("/products");
});

// Seller dashboard
router.get("/dashboard", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Unauthorized – only sellers can access the dashboard");
  }

  try {
    // Fetch products belonging to this seller
    const sellerProducts = await Product.find({ sellerId: req.session.user.id });

    // Calculate potential earnings (price × stock)
    const totalEarnings = sellerProducts.reduce(
      (sum, p) => sum + (p.price * p.quantity),
      0
    );

    const message = req.session.message;
    delete req.session.message; // clear after showing

    res.render("seller-dashboard", {
      products: sellerProducts,
      totalEarnings,
      user: req.session.user,
      message
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.send("Error loading dashboard");
  }
});

// Delete product (seller only)
router.post("/delete/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Unauthorized");
  }

  try {
    const product = await Product.findById(req.params.id);

    // Ensure product belongs to this seller
    if (!product || product.sellerId.toString() !== req.session.user.id) {
      return res.send("Unauthorized – cannot delete this product");
    }

    await Product.deleteOne({ _id: req.params.id });
    console.log("✅ Product deleted:", product.name);

    res.redirect("/products/dashboard");
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.send("Error deleting product");
  }
});

// Render edit product form
router.get("/edit/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Unauthorized");
  }

  try {
    const product = await Product.findById(req.params.id);

    // Ensure product belongs to this seller
    if (!product || product.sellerId.toString() !== req.session.user.id) {
      return res.send("Unauthorized – cannot edit this product");
    }

    res.render("edit-product", { product, user: req.session.user });
  } catch (err) {
    console.error("❌ Edit form error:", err);
    res.send("Error loading product for edit");
  }
});

// Handle edit form submission
router.post("/edit/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Unauthorized");
  }

  try {
    const { name, description, price, quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product || product.sellerId.toString() !== req.session.user.id) {
      return res.send("Unauthorized – cannot edit this product");
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.quantity = quantity;

    await product.save();
    console.log("✅ Product updated:", product.name);

    res.redirect("/products/dashboard");
  } catch (err) {
    console.error("❌ Edit save error:", err);
    res.send("Error updating product");
  }
});

// Handle edit form submission
router.post("/edit/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Unauthorized");
  }

  try {
    const { name, description, price, quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product || product.sellerId.toString() !== req.session.user.id) {
      return res.send("Unauthorized – cannot edit this product");
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.quantity = quantity;

    await product.save();

    // ✅ Set success message
    req.session.message = "Product updated successfully!";
    req.session.save(() => {
      res.redirect("/products/dashboard");
    });
  } catch (err) {
    console.error("❌ Edit save error:", err);
    res.send("Error updating product");
  }
});

// Delete product
router.post("/delete/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seller") {
    return res.send("Unauthorized");
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.sellerId.toString() !== req.session.user.id) {
      return res.send("Unauthorized – cannot delete this product");
    }

    await Product.deleteOne({ _id: req.params.id });

    // ✅ Set success message
    req.session.message = "Product deleted successfully!";
    req.session.save(() => {
      res.redirect("/products/dashboard");
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.send("Error deleting product");
  }
});

export default router;
