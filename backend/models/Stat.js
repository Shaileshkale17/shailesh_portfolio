const mongoose = require("mongoose");

// Impact-snapshot counters (e.g. "35% technical debt removed")
const statSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    suffix: { type: String, default: "" }, // e.g. "%", "+", "+ yrs"
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stat", statSchema);
