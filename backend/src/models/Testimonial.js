import mongoose from "mongoose";

/**
 * Testimonial schema — quotes from colleagues/managers.
 *
 * `published` lets an admin draft a testimonial before it's shown publicly;
 * `testimonialService` filters on this for non-admin reads.
 */
const testimonialSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    quote: { type: String, required: true },
    avatarUrl: { type: String, trim: true },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Matches the public filter + default sort used by testimonialService
// ({ published: true }, "order createdAt").
testimonialSchema.index({ published: 1, order: 1, createdAt: 1 });

export default mongoose.model("Testimonial", testimonialSchema);
