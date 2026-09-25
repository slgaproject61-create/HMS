const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    nationality: { type: String, default: "" },
    idType: { type: String, enum: ["Passport", "National ID", "Driver's License", "Other"], default: "Passport" },
    idNumber: { type: String, default: "" },
    preferences: { type: String, default: "" },
    loyaltyTier: { type: String, enum: ["Standard", "Silver", "Gold", "Platinum"], default: "Standard" },
    loyaltyPoints: { type: Number, default: 0 },
    totalStays: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    isVIP: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guest", guestSchema);
