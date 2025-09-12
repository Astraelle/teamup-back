const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ⚠️ corrige "Users" → "User"
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // liste des membres
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Team", teamSchema);
