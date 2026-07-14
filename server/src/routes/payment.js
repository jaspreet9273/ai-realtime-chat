const { Router } = require("express");
const { verifyGoogleToken } = require("../middleware/auth");
const PaymentController = require("../controllers/payment");

const router = Router();

router.post("/create-order", verifyGoogleToken, PaymentController.createOrder);
router.post("/verify", verifyGoogleToken, PaymentController.verify);

module.exports = router;
