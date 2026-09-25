const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Food & Beverage", "Spa & Wellness", "Business", "Transport", "Recreation", "Laundry", "Other"],
      default: "Other",
    },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "per request" },
    available: { type: Boolean, default: true },
    image: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
