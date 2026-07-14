const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleSub: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
