const express = require("express");
const router = express.Router();
const HousekeepingTask = require("../models/HousekeepingTask");
const { protect } = require("../middleware/auth");

// GET /api/housekeeping?status=&priority=&assignedTo=
router.get("/", protect, async (req, res) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (priority && priority !== "All") query.priority = priority;
    if (assignedTo) query.assignedTo = new RegExp(assignedTo, "i");
    if (search) query.roomNumber = new RegExp(search, "i");
    const tasks = await HousekeepingTask.find(query).sort({ scheduledDate: 1, priority: -1 });
    res.json({ data: tasks, total: tasks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/housekeeping/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/housekeeping
router.post("/", protect, async (req, res) => {
  try {
    if (!req.body.roomNumber)
      return res.status(400).json({ message: "Room number is required" });
    const task = await HousekeepingTask.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/housekeeping/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    if (req.body.status === "Completed" && !task.completedAt) {
      task.completedAt = new Date();
    }
    const updated = await task.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/housekeeping/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await HousekeepingTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
