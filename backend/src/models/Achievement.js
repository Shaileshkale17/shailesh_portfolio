import mongoose from "mongoose";

/**
 * Achievement schema — standalone accomplishments shown on the portfolio
 * (e.g. "Fastest intern-to-FTE conversion").
 */
const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date },
    // Controls manual display order on the frontend (lower = earlier).
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Matches the default sort used by achievementService ("order -date").
achievementSchema.index({ order: 1, date: -1 });

export default mongoose.model("Achievement", achievementSchema);
