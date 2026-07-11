import mongoose from "mongoose";

/**
 * Certification schema — professional certifications/badges.
 */
const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: Date },
    credentialUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Matches the default sort used by certificationService ("order -issueDate").
certificationSchema.index({ order: 1, issueDate: -1 });

export default mongoose.model("Certification", certificationSchema);
