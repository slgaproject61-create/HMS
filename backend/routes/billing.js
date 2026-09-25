const express = require("express");
const router = express.Router();
const Billing = require("../models/Billing");
const { protect } = require("../middleware/auth");

// GET /api/billing?status=&search=
router.get("/", protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ guestName: re }, { invoiceNo: re }, { roomNumber: re }];
    }
    const bills = await Billing.find(query).sort({ createdAt: -1 });
    res.json({ data: bills, total: bills.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/billing/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id).populate("reservation");
    if (!bill) return res.status(404).json({ message: "Invoice not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/billing
router.post("/", protect, async (req, res) => {
  try {
    const { guestName, items } = req.body;
    if (!guestName || !items || items.length === 0)
      return res.status(400).json({ message: "Guest name and at least one item are required" });

    const bill = await Billing.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/billing/:id – update status, payment, etc.
router.put("/:id", protect, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Invoice not found" });

    Object.assign(bill, req.body);

    // Auto-compute status from payment
    if (bill.amountPaid >= bill.total) bill.status = "Paid";
    else if (bill.amountPaid > 0) bill.status = "Partial";

    const updated = await bill.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/billing/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const bill = await Billing.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
