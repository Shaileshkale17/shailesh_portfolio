const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    quote: { type: String, required: true },
    avatarUrl: { type: String },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
