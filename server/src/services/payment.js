const crypto = require("crypto");
const Razorpay = require("razorpay");
const env = require("../config/env");
const PaymentOrder = require("../models/paymentOrder");
const User = require("../models/user");

const PREMIUM_AMOUNT_PAISE = 4900; // Defautl

function razorpayClient() {
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

function generateReceipt() {
  const base36Time = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString("hex");
  return `rcpt_${base36Time}_${random}`.slice(0, 40);
}

class PaymentService {
  static async createOrder(userId) {
    const receipt = generateReceipt();

    const order = await razorpayClient().orders.create({
      amount: PREMIUM_AMOUNT_PAISE,
      currency: "INR",
      receipt,
      notes: { userId },
    });

    await PaymentOrder.create({
      userId,
      razorpayOrderId: order.id,
      receipt,
      amount: PREMIUM_AMOUNT_PAISE,
      currency: "INR",
      status: "created",
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
    };
  }

  static async verifyAndUnlock({
    userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) {
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const isValid = expectedSignature === razorpaySignature;

    const order = await PaymentOrder.findOne({ razorpayOrderId, userId });
    if (!order) {
      throw new Error("Payment order not found for this user");
    }

    if (!isValid) {
      order.status = "failed";
      await order.save();
      throw new Error("Payment signature verification failed");
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    const user = await User.findOneAndUpdate(
      { googleSub: userId },
      { $set: { isPremium: true } },
      { new: true },
    );

    return user;
  }
}

module.exports = PaymentService;
