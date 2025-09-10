const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // liste des membres
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Teams", teamSchema);
