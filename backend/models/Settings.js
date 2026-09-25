const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    hotelName: { type: String, default: "LuxuryStay Hotel" },
    tagline: { type: String, default: "Where Elegance Meets Comfort" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },
    checkInTime: { type: String, default: "14:00" },
    checkOutTime: { type: String, default: "12:00" },
    taxRate: { type: Number, default: 10 },
    defaultCancellationPolicy: { type: String, default: "Free cancellation up to 24 hours before check-in." },
    logo: { type: String, default: "" },
    primaryColor: { type: String, default: "#C9A84C" },
    timezone: { type: String, default: "UTC" },
    smtpEnabled: { type: Boolean, default: false },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
