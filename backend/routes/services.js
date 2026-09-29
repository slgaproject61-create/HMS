const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect } = require("../middleware/auth");

// GET /api/services?category=&available=
router.get("/", protect, async (req, res) => {
  try {
    const { category, available } = req.query;
    const query = {};
    if (category && category !== "All") query.category = category;
    if (available !== undefined && available !== "") query.available = available === "true";
    const services = await Service.find(query).sort({ category: 1, name: 1 });
    res.json({ data: services, total: services.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/services/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/services
router.post("/", protect, async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined)
      return res.status(400).json({ message: "Service name and price are required" });
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/services/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after", runValidators: true,
    });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/services/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
