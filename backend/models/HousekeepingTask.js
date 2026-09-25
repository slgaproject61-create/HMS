const mongoose = require("mongoose");

const housekeepingSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    type: {
      type: String,
      enum: ["Daily Clean", "Deep Clean", "Turndown", "Inspection", "Post Checkout"],
      default: "Daily Clean",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Skipped"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    assignedTo: { type: String, default: "" },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledDate: { type: Date, default: Date.now },
    completedAt: { type: Date },
    notes: { type: String, default: "" },
    checklist: [{ item: String, done: { type: Boolean, default: false } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HousekeepingTask", housekeepingSchema);
