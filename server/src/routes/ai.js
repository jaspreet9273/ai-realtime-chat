const { Router } = require("express");
const { verifyGoogleToken } = require("../middleware/auth");
const AiController = require("../controllers/ai");

const router = Router();

router.post("/suggest-reply", verifyGoogleToken, AiController.suggestReply);
router.post("/summarize", verifyGoogleToken, AiController.summarize);

module.exports = router;
