require("dotenv").config();

function optional(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    console.warn(`[env] Warning: ${name} is not set`);
  }
  return value;
}

const env = {
  PORT: Number(process.env.PORT || 4000),
  CLIENT_ORIGIN: optional("CLIENT_ORIGIN", "http://localhost:3000"),
  MONGODB_URI: optional("MONGODB_URI"),
  GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID"),
  GEMINI_API_KEY: optional("GEMINI_API_KEY"),
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
  RAZORPAY_KEY_ID: optional("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET: optional("RAZORPAY_KEY_SECRET"),
};

module.exports = env;
