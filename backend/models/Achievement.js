import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    date: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Achievement", achievementSchema);
