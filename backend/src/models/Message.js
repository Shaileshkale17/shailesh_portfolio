import mongoose from "mongoose";

/**
 * Message schema — contact-form submissions from portfolio visitors.
 */
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true },
    // Lets the admin inbox filter unread messages quickly.
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// The admin inbox lists newest-first and commonly filters by read/unread.
messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1 });

export default mongoose.model("Message", messageSchema);
