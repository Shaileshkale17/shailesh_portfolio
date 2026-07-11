import mongoose from "mongoose";

/**
 * Skill schema — grouped skill bars shown on the portfolio (e.g. React
 * under "Frontend" at 92% proficiency).
 */
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Languages", "Frontend", "Backend", "Database & Tools"],
      required: true,
    },
    proficiency: { type: Number, min: 0, max: 100, default: 80 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Matches the default sort used by skillService ("category order") and
// supports filtering the skill list by category.
skillSchema.index({ category: 1, order: 1 });

export default mongoose.model("Skill", skillSchema);
