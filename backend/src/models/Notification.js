import mongoose from "mongoose";

/**
 * Notification schema — in-app alerts for the admin dashboard's
 * notification bell: new contact submissions, visitor milestones, failed
 * integrations, and general system alerts.
 */
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["new_message", "visitor_milestone", "integration_failed", "system_alert"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    // Extra context for the frontend to act on, e.g. { messageId } for "new_message".
    meta: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ read: 1 });

export default mongoose.model("Notification", notificationSchema);
