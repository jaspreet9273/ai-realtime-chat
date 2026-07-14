const mongoose = require("mongoose");

const paymentOrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Google sub
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    receipt: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema);
