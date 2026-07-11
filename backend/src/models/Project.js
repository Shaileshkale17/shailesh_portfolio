import mongoose from "mongoose";

/**
 * Project schema — portfolio case studies.
 *
 * `slug` is the URL-friendly identifier used by the public site
 * (e.g. `/projects/event-management-platform`) and is enforced unique.
 */
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Headline metric shown on the project card, e.g. "30% faster load".
    metric: { type: String, trim: true },
    summary: { type: String, required: true },
    problem: { type: String, trim: true },
    architecture: { type: String, trim: true },
    decisions: { type: String, trim: true },
    learnings: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: ["Frontend", "Full-stack", "Performance", "Other"],
      default: "Full-stack",
    },
    thumbnailUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    repoUrl: { type: String, trim: true },
    // Featured projects are pinned to the top of the public listing.
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// `unique: true` above already creates an index on `slug`.
// This one matches the default sort used by projectService ("-featured order createdAt").
projectSchema.index({ featured: -1, order: 1, createdAt: -1 });
projectSchema.index({ category: 1 });

export default mongoose.model("Project", projectSchema);
