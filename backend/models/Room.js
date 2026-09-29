const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["Standard", "Deluxe", "Executive Suite", "Presidential Suite", "Penthouse"],
      default: "Standard",
    },
    floor: { type: String, default: "1" },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Cleaning", "Maintenance", "Out of Service"],
      default: "Available",
    },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, default: 2, min: 1 },
    name: { type: String, trim: true, default: "" },
    bed: { type: String, trim: true, default: "King Bed" },
    view: { type: String, trim: true, default: "City View" },
    size: { type: String, trim: true, default: "" },
    tag: { type: String, trim: true, default: "" },
    amenities: { type: String, default: "" },
    description: { type: String, default: "" },
    images: [{ type: String }],
    lastCleaned: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
