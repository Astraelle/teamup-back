const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  location: {
    type: { type: String, default: "Point" },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  date: { type: String, required: true }, // 📅 YYYY-MM-DD
  startTime: { type: String, required: true }, // ⏰ HH:mm

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],

  maxParticipants: { type: Number, default: 0 }, // 0 = illimité
  status: { type: String, enum: ["open", "cancelled"], default: "open" }, // état de l’événement
}, { timestamps: true });

eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Events", eventSchema);

