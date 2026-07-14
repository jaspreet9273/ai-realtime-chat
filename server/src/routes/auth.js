const { Router } = require("express");
const { verifyGoogleToken } = require("../middleware/auth");
const AuthController = require("../controllers/auth");

const router = Router();

router.post("/verify", verifyGoogleToken, AuthController.verify);

module.exports = router;
