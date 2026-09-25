const express = require("express");
const router = express.Router();
const MaintenanceRequest = require("../models/MaintenanceRequest");
const { protect } = require("../middleware/auth");

// GET /api/maintenance?status=&priority=&category=
router.get("/", protect, async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (priority && priority !== "All") query.priority = priority;
    if (category && category !== "All") query.category = category;
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ title: re }, { roomNumber: re }, { ticketNo: re }];
    }
    const requests = await MaintenanceRequest.find(query).sort({ createdAt: -1 });
    res.json({ data: requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/maintenance/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const req_ = await MaintenanceRequest.findById(req.params.id);
    if (!req_) return res.status(404).json({ message: "Request not found" });
    res.json(req_);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/maintenance
router.post("/", protect, async (req, res) => {
  try {
    if (!req.body.title)
      return res.status(400).json({ message: "Title is required" });
    const request = await MaintenanceRequest.create({
      ...req.body,
      reportedBy: req.body.reportedBy || req.user.name,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/maintenance/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    Object.assign(request, req.body);
    if (
      (req.body.status === "Resolved" || req.body.status === "Closed") &&
      !request.resolvedAt
    ) {
      request.resolvedAt = new Date();
    }
    const updated = await request.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/maintenance/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
