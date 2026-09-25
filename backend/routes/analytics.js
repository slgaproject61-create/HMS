const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const Guest = require("../models/Guest");
const Billing = require("../models/Billing");
const Feedback = require("../models/Feedback");
const { protect } = require("../middleware/auth");

// GET /api/analytics/summary
router.get("/summary", protect, async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: "Occupied" });
    const availableRooms = await Room.countDocuments({ status: "Available" });
    const totalGuests = await Guest.countDocuments();
    const activeReservations = await Reservation.countDocuments({
      status: { $in: ["Confirmed", "Checked-in"] },
    });
    const totalReservations = await Reservation.countDocuments();

    // Monthly revenue: sum of paid bills this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyBills = await Billing.find({
      status: { $in: ["Paid", "Partial"] },
      createdAt: { $gte: startOfMonth },
    });
    const monthlyRevenue = monthlyBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    // Total revenue all time
    const allBills = await Billing.find({ status: { $in: ["Paid", "Partial"] } });
    const totalRevenue = allBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    // Avg rating
    const feedbackDocs = await Feedback.find();
    const avgRating =
      feedbackDocs.length > 0
        ? (feedbackDocs.reduce((s, f) => s + f.overallRating, 0) / feedbackDocs.length).toFixed(1)
        : 0;

    // Occupancy rate
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
      totalGuests,
      activeReservations,
      totalReservations,
      monthlyRevenue,
      totalRevenue,
      avgRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/occupancy – last 7 days occupancy data
router.get("/occupancy", protect, async (req, res) => {
  try {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const occupied = await Reservation.countDocuments({
        status: { $in: ["Confirmed", "Checked-in"] },
        checkIn: { $lte: nextDay },
        checkOut: { $gte: day },
      });
      const total = await Room.countDocuments();
      result.push({
        date: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        occupied,
        available: total - occupied,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/revenue – last 6 months revenue
router.get("/revenue", protect, async (req, res) => {
  try {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const bills = await Billing.find({
        status: { $in: ["Paid", "Partial"] },
        createdAt: { $gte: start, $lt: end },
      });
      const revenue = bills.reduce((s, b) => s + (b.amountPaid || 0), 0);
      result.push({
        month: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        revenue,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/room-status
router.get("/room-status", protect, async (req, res) => {
  try {
    const statuses = ["Available", "Occupied", "Cleaning", "Maintenance", "Out of Service"];
    const data = await Promise.all(
      statuses.map(async (s) => ({ status: s, count: await Room.countDocuments({ status: s }) }))
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
