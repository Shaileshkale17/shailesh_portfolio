import mongoose from "mongoose";

/**
 * AnalyticsEvent schema — a single collection backing both the "Analytics
 * Section" (pageviews: totals, growth, top pages, country/device/browser,
 * referrers) and the "Portfolio Analytics" section (engagement events:
 * resume downloads, project/social/contact/email/phone clicks).
 *
 * Kept as one collection (discriminated by `type`) rather than two, since
 * both are the same shape (a timestamped visitor action) and most
 * dashboard queries want to reason about both together.
 */
const analyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["pageview", "event"], required: true },

    // Populated for `type: "pageview"` — the route the visitor viewed, e.g. "/projects/foo".
    page: { type: String, trim: true },

    // Populated for `type: "event"` — which engagement action occurred.
    eventName: {
      type: String,
      enum: [
        "resume_download",
        "project_click",
        "social_click",
        "contact_click",
        "email_click",
        "phone_click",
      ],
    },

    // Free-form extra context, e.g. { project: "event-management-platform" } or { platform: "github" }.
    meta: { type: mongoose.Schema.Types.Mixed },

    // Client-generated id (e.g. stored in sessionStorage) used to de-duplicate
    // a visitor's pageviews into a single "visitor" for count purposes.
    sessionId: { type: String, required: true, trim: true },

    referrer: { type: String, trim: true, default: "" },

    // Derived server-side — from Vercel's `x-vercel-ip-country` edge header when
    // deployed there, else whatever the client supplied (e.g. via a client-side
    // geolocation API), else "Unknown". See analyticsService.track.
    country: { type: String, trim: true, default: "Unknown" },

    // Derived server-side from the User-Agent header — see utils/parseUserAgent.js.
    device: { type: String, enum: ["desktop", "mobile", "tablet", "other"], default: "other" },
    browser: { type: String, trim: true, default: "Unknown" },
  },
  { timestamps: true }
);

// Dashboard queries filter by type + a createdAt range almost every time.
analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ page: 1 });
analyticsEventSchema.index({ eventName: 1 });
analyticsEventSchema.index({ sessionId: 1 });

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
