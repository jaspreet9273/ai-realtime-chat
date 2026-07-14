const AiService = require("../services/ai");
const ChatService = require("../services/chat");

class AiController {
  static async suggestReply(req, res, next) {
    try {
      const recent = await ChatService.getRecentHistory(15);
      const suggestion = await AiService.suggestReply(
        recent.map(ChatService.toPublicMessage),
      );
      res.json({ suggestion });
    } catch (err) {
      next(err);
    }
  }

  static async summarize(req, res, next) {
    try {
      if (!req.user.isPremium) {
        return res
          .status(403)
          .json({ error: "This feature requires premium access" });
      }
      const history = await ChatService.getAllHistoryForSummary();
      const summary = await AiService.summarizeChat(
        history.map(ChatService.toPublicMessage),
      );
      res.json({ summary });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AiController;
