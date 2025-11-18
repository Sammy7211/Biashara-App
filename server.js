import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import fs from "fs";

// Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "biasharaSecret123",
  resave: false,
  saveUninitialized: true
}));

// ===== View Engine =====
app.use(expressLayouts);
app.set("layout", "layout"); // default layout file views/layout.ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Routes =====
app.use("/", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);

// Redirect root to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// ===== Optional debug route to check image existence =====
app.get("/test-image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imgPath = path.join(__dirname, "public/images", filename);
  fs.access(imgPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.send(`❌ File does NOT exist: ${imgPath}`);
    } else {
      res.send(`✅ File exists: ${imgPath}`);
    }
  });
});

// ===== MongoDB =====
mongoose.connect("mongodb://localhost:27017/biasharaDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// ===== Start server =====
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);