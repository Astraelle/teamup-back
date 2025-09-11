const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  date: { type: Date, required: true },
  startTime: { type: String , required: true}, // ⏰ nouvel attribut
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
});

eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Events", eventSchema);
