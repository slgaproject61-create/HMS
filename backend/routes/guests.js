const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");
const { protect } = require("../middleware/auth");

// GET /api/guests?search=&tier=
router.get("/", protect, async (req, res) => {
  try {
    const { search, tier } = req.query;
    const query = {};
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ name: re }, { email: re }, { phone: re }];
    }
    if (tier && tier !== "All") query.loyaltyTier = tier;
    const guests = await Guest.find(query).sort({ createdAt: -1 });
    res.json({ data: guests, total: guests.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/guests/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/guests
router.post("/", protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });

    const exists = await Guest.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "A guest with that email already exists" });

    const guest = await Guest.create(req.body);
    res.status(201).json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/guests/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after", runValidators: true,
    });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/guests/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json({ message: "Guest deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
