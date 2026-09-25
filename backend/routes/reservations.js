const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const { protect } = require("../middleware/auth");

// GET /api/reservations?search=&status=&date=
router.get("/", protect, async (req, res) => {
  try {
    const { search, status, date } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ guestName: re }, { roomNumber: re }, { confirmationNo: re }];
    }
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      query.checkIn = { $gte: d, $lt: next };
    }
    const reservations = await Reservation.find(query).sort({ createdAt: -1 });
    res.json({ data: reservations, total: reservations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reservations/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const res_ = await Reservation.findById(req.params.id);
    if (!res_) return res.status(404).json({ message: "Reservation not found" });
    res.json(res_);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reservations
router.post("/", protect, async (req, res) => {
  try {
    const { guestName, roomNumber, checkIn, checkOut } = req.body;
    if (!guestName || !roomNumber || !checkIn || !checkOut)
      return res.status(400).json({ message: "Guest name, room number, check-in, and check-out are required" });

    const reservation = await Reservation.create({
      ...req.body,
      createdBy: req.user._id,
    });

    // Mark room as Occupied if checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    if (checkInDate <= today) {
      await Room.findOneAndUpdate({ number: roomNumber }, { status: "Occupied" });
    }

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reservations/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const prev = await Reservation.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: "Reservation not found" });

    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    // Sync room status on check-in / check-out / cancel
    const { status } = req.body;
    if (status === "Checked-in") {
      await Room.findOneAndUpdate({ number: updated.roomNumber }, { status: "Occupied" });
    } else if (status === "Checked-out") {
      await Room.findOneAndUpdate({ number: updated.roomNumber }, { status: "Cleaning" });
    } else if (status === "Cancelled") {
      await Room.findOneAndUpdate({ number: updated.roomNumber }, { status: "Available" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reservations/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    res.json({ message: "Reservation cancelled and deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
