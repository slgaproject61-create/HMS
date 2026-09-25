const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    confirmationNo: { type: String, unique: true },
    guestName: { type: String, required: true, trim: true },
    guestEmail: { type: String, default: "" },
    guestPhone: { type: String, default: "" },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest" },
    roomNumber: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "Checked-in", "Checked-out", "Cancelled", "No-show"],
      default: "Confirmed",
    },
    source: {
      type: String,
      enum: ["Direct", "Online", "Phone", "Travel Agent", "OTA"],
      default: "Direct",
    },
    notes: { type: String, default: "" },
    totalPrice: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate confirmation number
reservationSchema.pre("save", async function () {
  if (!this.confirmationNo) {
    const count = await this.constructor.countDocuments();
    this.confirmationNo = `RES-${String(1000 + count + 1).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);
