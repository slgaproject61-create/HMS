const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["spa_booking", "experience_inquiry", "contact_message"],
      required: true,
    },
    guestName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },

    // Spa fields
    treatment: { type: String, default: "" },
    preferredDate: { type: String, default: "" },
    preferredTime: { type: String, default: "" },

    // Experience fields
    experience: { type: String, default: "" },
    guestCount: { type: Number, default: 1 },

    // Contact fields
    subject: { type: String, default: "" },
    message: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["New", "Reviewed", "Confirmed", "Declined"],
      default: "New",
    },
    staffNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
