import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// ===== Render pages =====

// Login page
router.get("/login", (req, res) => {
  res.render("login"); // renders views/login.ejs
});

// Register page
router.get("/register", (req, res) => {
  res.render("register"); // renders views/register.ejs
});

// ===== Handle form submissions =====

// Register user
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in DB
    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    // Redirect to login after successful registration
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Error registering user");
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    // Compare passwords
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.send("Incorrect password");

    // Redirect to products page after successful login
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.send("Error logging in");
  }
});

export default router;
