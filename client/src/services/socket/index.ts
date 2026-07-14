import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "./socket-events";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

let socket: Socket | null = null;
let hasJoinedThisConnection = false;

function ensureJoinResetOnReconnect(s: Socket) {
  s.on("connect", () => {
    hasJoinedThisConnection = false;
  });
}

export const socketService = {
  connect(idToken: string): Socket {
    if (socket) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      auth: { token: idToken },
      autoConnect: true,
      reconnection: true,
    });

    ensureJoinResetOnReconnect(socket);
    return socket;
  },

  getSocket(): Socket | null {
    return socket;
  },

  join() {
    if (!socket || hasJoinedThisConnection) return;
    hasJoinedThisConnection = true;
    socket.emit(SOCKET_EVENTS.CHAT_JOIN);
  },

  sendMessage(text: string) {
    socket?.emit(SOCKET_EVENTS.CHAT_SEND, { text });
  },

  disconnect() {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
      hasJoinedThisConnection = false;
    }
  },
};

export { SOCKET_EVENTS };
