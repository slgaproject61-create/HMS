const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const { protect } = require("../middleware/auth");

// POST /api/inquiries — Public: guests submit spa, experience, contact forms
router.post("/", async (req, res) => {
  try {
    const { type, guestName, email } = req.body;
    if (!type || !guestName || !email) {
      return res.status(400).json({ message: "type, guestName and email are required" });
    }
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/inquiries — Protected: staff can view all inquiries
router.get("/", protect, async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type && type !== "All") query.type = type;
    if (status && status !== "All") query.status = status;
    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    res.json({ data: inquiries, total: inquiries.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/inquiries/:id — Protected: staff update status or notes
router.put("/:id", protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/inquiries/:id — Protected
router.delete("/:id", protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
