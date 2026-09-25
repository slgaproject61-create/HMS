const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    guestName: { type: String, required: true },
    guestEmail: { type: String, default: "" },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest" },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    reservationNo: { type: String, default: "" },
    stayDate: { type: Date },
    overallRating: { type: Number, min: 1, max: 5, required: true },
    ratings: {
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      service: { type: Number, min: 1, max: 5, default: 5 },
      amenities: { type: Number, min: 1, max: 5, default: 5 },
      location: { type: Number, min: 1, max: 5, default: 5 },
      valueForMoney: { type: Number, min: 1, max: 5, default: 5 },
    },
    comment: { type: String, default: "" },
    response: { type: String, default: "" },
    respondedBy: { type: String, default: "" },
    respondedAt: { type: Date },
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      default: "Positive",
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-compute sentiment
feedbackSchema.pre("save", function () {
  if (this.overallRating >= 4) this.sentiment = "Positive";
  else if (this.overallRating === 3) this.sentiment = "Neutral";
  else this.sentiment = "Negative";
});

module.exports = mongoose.model("Feedback", feedbackSchema);
