const AuthService = require("../services/auth");
const ChatService = require("../services/chat");
const EVENTS = require("./events");

class SocketHandler {
  constructor(io, socketRegistry) {
    this.io = io;
    this.socketRegistry = socketRegistry;
  }

  attach() {
    this.io.use(this._authenticateHandshake.bind(this));
    this.io.on("connection", (socket) => this._onConnection(socket));
  }

  async _authenticateHandshake(socket, next) {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Missing id_token in socket auth payload"));
      }
      const payload = await AuthService.verifyIdToken(token);
      const user = await AuthService.upsertFromGooglePayload(payload);
      socket.data.user = user;
      next();
    } catch (err) {
      console.error("socket handshake auth failed:", err.message);
      next(new Error("Unauthorized"));
    }
  }

  async _onConnection(socket) {
    const user = socket.data.user;
    const userId = user.googleSub;

    this._registerSocket(userId, socket.id);
    console.log(`socket connected: ${socket.id} (user=${userId})`);

    let hasJoined = false;

    socket.on(EVENTS.CHAT_JOIN, async () => {
      if (hasJoined) return;
      hasJoined = true;
      try {
        const history = await ChatService.getRecentHistory();
        socket.emit(
          EVENTS.CHAT_HISTORY,
          history.map(ChatService.toPublicMessage),
        );
      } catch (err) {
        console.error("socket failed to load history:", err.message);
        socket.emit(EVENTS.CHAT_ERROR, {
          error: "Failed to load chat history",
        });
      }
    });

    socket.on(EVENTS.CHAT_SEND, async (payload) => {
      try {
        const text = typeof payload?.text === "string" ? payload.text : "";

        const saved = await ChatService.createMessage({
          userId,
          name: user.name,
          picture: user.picture,
          text,
        });

        this.io.emit(EVENTS.CHAT_MESSAGE, ChatService.toPublicMessage(saved));
      } catch (err) {
        console.error("socket failed to persist message:", err.message);
        socket.emit(EVENTS.CHAT_ERROR, { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      this._unregisterSocket(userId, socket.id);
      console.log(`socket disconnected: ${socket.id} (user=${userId})`);
    });
  }

  _registerSocket(userId, socketId) {
    if (!this.socketRegistry.has(userId)) {
      this.socketRegistry.set(userId, new Set());
    }
    this.socketRegistry.get(userId).add(socketId);
  }

  _unregisterSocket(userId, socketId) {
    const set = this.socketRegistry.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) {
      this.socketRegistry.delete(userId);
    }
  }
}

module.exports = SocketHandler;
