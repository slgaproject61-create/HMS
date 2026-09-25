const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, unique: true },
    roomNumber: { type: String, default: "" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    location: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Electrical", "Plumbing", "HVAC", "Furniture", "IT/Electronics", "Structural", "Other"],
      default: "Other",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Critical"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "On Hold", "Resolved", "Closed"],
      default: "Open",
    },
    reportedBy: { type: String, default: "" },
    assignedTo: { type: String, default: "" },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    resolvedAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate ticket number
maintenanceSchema.pre("save", async function () {
  if (!this.ticketNo) {
    const count = await this.constructor.countDocuments();
    this.ticketNo = `MNT-${String(100 + count + 1).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model("MaintenanceRequest", maintenanceSchema);
