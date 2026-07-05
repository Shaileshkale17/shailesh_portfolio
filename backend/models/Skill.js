const mongoose = require("mongoose");

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

module.exports = mongoose.model("Skill", skillSchema);
