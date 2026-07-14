const Message = require("../models/message");

const HISTORY_LIMIT = 50;

class ChatService {
  static async createMessage({ userId, name, picture, text }) {
    const trimmed = (text || "").trim();
    if (!trimmed) {
      throw new Error("Message text cannot be empty");
    }
    const message = await Message.create({
      userId,
      name,
      picture,
      text: trimmed,
    });
    return message;
  }

  static async getRecentHistory(limit = HISTORY_LIMIT) {
    const docs = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.reverse();
  }

  static async getAllHistoryForSummary(limit = 300) {
    const docs = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.reverse();
  }

  static toPublicMessage(doc) {
    return {
      id: String(doc._id),
      userId: doc.userId,
      name: doc.name,
      picture: doc.picture,
      text: doc.text,
      createdAt: doc.createdAt,
    };
  }
}

module.exports = ChatService;
