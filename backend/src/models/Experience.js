import mongoose from "mongoose";

/**
 * Experience schema — work history entries shown on the portfolio timeline.
 */
const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    // Free-text display line, e.g. "Bangalore (Remote) · Oct 2025 – Present".
    meta: { type: String, trim: true },
    description: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Matches the default sort used by experienceService ("order -startDate").
experienceSchema.index({ order: 1, startDate: -1 });

export default mongoose.model("Experience", experienceSchema);
