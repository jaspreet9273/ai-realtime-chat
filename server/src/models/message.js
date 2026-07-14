const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    picture: { type: String },
    text: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true },
);

messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
