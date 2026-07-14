const PaymentService = require("../services/payment");
const AuthService = require("../services/auth");

class PaymentController {
  static async createOrder(req, res, next) {
    try {
      const order = await PaymentService.createOrder(req.user.googleSub);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  static async verify(req, res, next) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        req.body;
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res
          .status(400)
          .json({ error: "Missing payment verification fields" });
      }

      const user = await PaymentService.verifyAndUnlock({
        userId: req.user.googleSub,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      const io = req.app.get("io");
      const socketRegistry = req.app.get("socketRegistry");
      const socketIds = socketRegistry.get(req.user.googleSub) || [];
      for (const socketId of socketIds) {
        io.to(socketId).emit("payment:success", {
          user: AuthService.toPublicUser(user),
        });
      }

      res.json({ user: AuthService.toPublicUser(user) });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
