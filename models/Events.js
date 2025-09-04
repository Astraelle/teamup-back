const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

eventSchema.index({ location: "2dsphere" }); // pour recherche géolocalisée

module.exports = mongoose.model('Events', eventSchema);
