import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// ===== Render Pages =====

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register page
router.get("/register", (req, res) => {
  res.render("register");
});

// Role selection page (for users with multiple roles)
router.get("/select-role", (req, res) => {
  if (!req.session.tempUser) return res.redirect("/login");
  res.render("select-role", { roles: req.session.tempUser.roles });
});

// ===== Handle Form Submissions =====

// Register user
router.post("/register", async (req, res) => {
  console.log("Register req.body:", req.body);

  const { firstName, lastName, email, password, role } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    // Always wrap role in an array
    const userRoles = Array.isArray(role) ? role : [role];

    await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      roles: userRoles
    });

    res.redirect("/login");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.send("Error registering user");
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  console.log("Login req.body:", req.body);

  if (!email || !password) {
    return res.send("Missing email or password");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.send("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("❌ Incorrect password for:", email);
      return res.send("Incorrect password");
    }

    // Ensure role is set correctly
    const role = (user.roles && user.roles.length > 0) ? user.roles[0] : "buyer";

    // If multiple roles, redirect to role selection
    if (user.roles.length > 1) {
      req.session.tempUser = { id: user._id.toString(), name: user.firstName, roles: user.roles };
      return req.session.save(() => res.redirect("/select-role"));
    }

    // Single role, directly login
    req.session.user = { id: user._id.toString(), name: user.firstName, role };
    console.log("✅ Logged in user session:", req.session.user);

    // Ensure session is saved before redirect
    req.session.save(() => {
      res.redirect("/products");
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.send("Error logging in");
  }
});

// Handle role selection (for multi-role users)
router.post("/select-role", (req, res) => {
  const chosenRole = req.body.role;
  const tempUser = req.session.tempUser;
  if (!tempUser || !tempUser.roles.includes(chosenRole)) return res.redirect("/login");

  req.session.user = { id: tempUser.id, name: tempUser.name, role: chosenRole };
  delete req.session.tempUser;

  req.session.save(() => {
    res.redirect("/products");
  });
});

// ===== NEW: Role Upgrade =====
router.post("/upgrade-role", async (req, res) => {
  console.log("Upgrade attempt, session user:", req.session.user);

  if (!req.session.user) return res.send("Unauthorized");

  const newRole = req.body.role; // e.g. "seller"

  try {
    // Add role if not already present
    await User.updateOne(
      { _id: req.session.user.id },
      { $addToSet: { roles: newRole } }
    );

    // Update session role immediately
    req.session.user.role = newRole;
    console.log("✅ Role upgraded:", req.session.user);

    req.session.save(() => {
      res.redirect("/products");
    });
  } catch (err) {
    console.error("❌ Role upgrade error:", err);
    res.send("Error upgrading role");
  }
});

export default router;
