import mongoose from "mongoose";

/**
 * Stat schema — impact-snapshot counters shown on the homepage
 * (e.g. "35% technical debt removed").
 */
const statSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    // Display suffix, e.g. "%", "+", "+ yrs".
    suffix: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Matches the default sort used by statsService ("order").
statSchema.index({ order: 1 });

export default mongoose.model("Stat", statSchema);
