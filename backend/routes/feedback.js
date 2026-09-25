const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const { protect } = require("../middleware/auth");

// GET /api/feedback?sentiment=&rating=
router.get("/", protect, async (req, res) => {
  try {
    const { sentiment, search } = req.query;
    const query = {};
    if (sentiment && sentiment !== "All") query.sentiment = sentiment;
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ guestName: re }, { comment: re }];
    }
    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    res.json({ data: feedback, total: feedback.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/feedback
router.post("/", async (req, res) => {
  // Public endpoint – guests can post without auth
  try {
    const { guestName, overallRating } = req.body;
    if (!guestName || !overallRating)
      return res.status(400).json({ message: "Guest name and rating are required" });
    const fb = await Feedback.create(req.body);
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/feedback/:id – staff can respond
router.put("/:id", protect, async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    Object.assign(fb, req.body);
    if (req.body.response && !fb.respondedAt) {
      fb.respondedAt = new Date();
      fb.respondedBy = req.user.name;
    }
    const updated = await fb.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/feedback/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndDelete(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
