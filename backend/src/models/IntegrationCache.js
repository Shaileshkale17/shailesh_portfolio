import mongoose from "mongoose";

/**
 * IntegrationCache schema — stores the last successfully synced snapshot
 * for an external integration (GitHub, LeetCode). Reading the dashboard
 * hits this cache instead of the live third-party API on every page load
 * (avoiding rate limits + slow requests); the cache itself is refreshed by
 * the cron job / sync endpoint in `src/cron/integrationSync.cron.js`.
 */
const integrationCacheSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ["github", "leetcode"], required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // `updatedAt` above is managed manually on each sync
);

export default mongoose.model("IntegrationCache", integrationCacheSchema);
