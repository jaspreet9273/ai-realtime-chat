const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const errorHandler = require("./middleware/error");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const paymentRoutes = require("./routes/payment");

function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.type("text/plain").send("hi, ai-realtime-chat");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/payment", paymentRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
