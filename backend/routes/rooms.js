const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { protect } = require("../middleware/auth");

// GET /api/rooms?status=&type=&search=
router.get("/", protect, async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (type && type !== "All") query.type = type;
    if (search) query.number = new RegExp(search, "i");
    const rooms = await Room.find(query).sort({ number: 1 });
    res.json({ data: rooms, total: rooms.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rooms/stats – room counts by status (MUST be before /:id)
router.get("/stats", protect, async (req, res) => {
  try {
    const statuses = ["Available", "Occupied", "Cleaning", "Maintenance", "Out of Service"];
    const stats = {};
    for (const s of statuses) {
      stats[s] = await Room.countDocuments({ status: s });
    }
    stats.total = await Room.countDocuments();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rooms/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms
router.post("/", protect, async (req, res) => {
  try {
    const { number, pricePerNight } = req.body;
    if (!number || pricePerNight === undefined)
      return res.status(400).json({ message: "Room number and price are required" });

    const exists = await Room.findOne({ number });
    if (exists) return res.status(409).json({ message: `Room ${number} already exists` });

    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/rooms/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/rooms/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
