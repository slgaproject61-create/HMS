const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Guest = require("../models/Guest");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "luxurystay_super_secret_jwt_key_2026", { expiresIn: "7d" });

// POST /api/auth/register-guest
router.post("/register-guest", async (req, res) => {
  try {
    const { name, email, password, phone, preferences } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Create User record
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "Customer",
      phone: phone ? phone.trim() : "",
      isActive: true,
    });

    // Create or update corresponding Guest profile for hotel administration
    let guest = await Guest.findOne({ email: email.toLowerCase() });
    if (!guest) {
      guest = await Guest.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : "",
        preferences: preferences ? preferences.trim() : "Ocean View, High Floor",
        loyaltyTier: "Silver",
        loyaltyPoints: 250, // Welcome bonus points
        totalStays: 0,
        isVIP: false,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "Customer",
        type: "customer",
        loyaltyTier: guest.loyaltyTier,
        loyaltyPoints: guest.loyaltyPoints,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive)
      return res.status(403).json({ message: "Account disabled. Contact hotel administration." });

    user.lastLogin = new Date();
    await user.save();

    const isCust = user.role === "Customer";
    let guestDetails = null;
    if (isCust) {
      guestDetails = await Guest.findOne({ email: user.email });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        type: isCust ? "customer" : "staff",
        loyaltyTier: guestDetails?.loyaltyTier || "Standard",
        loyaltyPoints: guestDetails?.loyaltyPoints || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout – stateless JWT; client drops token
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

// GET /api/auth/me – returns current logged-in user
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
