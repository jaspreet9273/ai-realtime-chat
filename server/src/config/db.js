const mongoose = require("mongoose");
const env = require("./env");

class Database {
  static async connect() {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  }

  static async disconnect() {
    await mongoose.disconnect();
  }
}

module.exports = Database;
