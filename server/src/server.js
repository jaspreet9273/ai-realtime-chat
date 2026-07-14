const http = require("http");
const { Server } = require("socket.io");

const env = require("./config/env");
const Database = require("./config/db");
const createApp = require("./app");
const SocketHandler = require("./socket/handler");

async function main() {
  await Database.connect();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
  });

  const socketRegistry = new Map();
  app.set("io", io);
  app.set("socketRegistry", socketRegistry);

  new SocketHandler(io, socketRegistry).attach();

  httpServer.listen(env.PORT, () => {
    console.log(`server listening on port ${env.PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`server received ${signal}, shutting down...`);
    io.close();
    httpServer.close(async () => {
      await Database.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("server fatal startup error:", err);
  process.exit(1);
});
