const mongoose = require("mongoose");

const billingItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const billingSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    guestName: { type: String, required: true },
    guestEmail: { type: String, default: "" },
    roomNumber: { type: String, default: "" },
    checkIn: { type: Date },
    checkOut: { type: Date },
    items: [billingItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.1 }, // 10%
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid", "Refunded", "Void"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Online", ""],
      default: "",
    },
    amountPaid: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate invoice number
billingSchema.pre("save", async function () {
  if (!this.invoiceNo) {
    const count = await this.constructor.countDocuments();
    this.invoiceNo = `INV-${String(2000 + count + 1).padStart(4, "0")}`;
  }
  // Recalculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.taxAmount = parseFloat((this.subtotal * this.taxRate).toFixed(2));
  this.total = parseFloat((this.subtotal + this.taxAmount - this.discount).toFixed(2));
});

module.exports = mongoose.model("Billing", billingSchema);
