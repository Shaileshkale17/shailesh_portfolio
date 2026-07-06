import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    metric: { type: String, trim: true }, // e.g. "30% faster load"
    summary: { type: String, required: true },
    problem: { type: String },
    architecture: { type: String },
    decisions: { type: String },
    learnings: { type: String },
    tags: [{ type: String, trim: true }],
    category: { type: String, enum: ["Frontend", "Full-stack", "Performance", "Other"], default: "Full-stack" },
    thumbnailUrl: { type: String },
    liveUrl: { type: String },
    repoUrl: { type: String },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
