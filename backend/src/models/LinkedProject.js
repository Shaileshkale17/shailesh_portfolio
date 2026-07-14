import mongoose from "mongoose";
import { encrypt } from "../utils/crypto.js";

/**
 * LinkedProject schema — external websites/projects connected to the
 * "Project Integration" section of the admin dashboard (e.g. the Event
 * Management site, a Blog, an Ecommerce storefront). Each one can expose
 * its own analytics endpoint that this dashboard polls to pull in stats.
 *
 * `apiKey` is encrypted at rest (AES-256-GCM, see utils/crypto.js) and
 * excluded from default queries via `select: false` — it's only ever
 * decrypted inside `linkedProjectService.sync()`.
 */
const linkedProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "Other" },
    description: { type: String, trim: true },

    // Endpoint this dashboard calls to pull in that project's analytics (optional —
    // a linked project can exist purely as a bookmark/status entry without one).
    analyticsEndpoint: { type: String, trim: true },
    apiKey: { type: String, trim: true, select: false },

    enabled: { type: Boolean, default: true },

    lastSyncedAt: { type: Date, default: null },
    lastStats: { type: mongoose.Schema.Types.Mixed, default: null },
    lastSyncError: { type: String, default: null },
  },
  { timestamps: true }
);

linkedProjectSchema.index({ enabled: 1 });

/** Encrypts `apiKey` before saving a new document (Model.create/doc.save path). */
linkedProjectSchema.pre("save", function encryptApiKeyIfModified(next) {
  if (!this.isModified("apiKey") || !this.apiKey) return next();
  this.apiKey = encrypt(this.apiKey);
  next();
});

/**
 * Encrypts `apiKey` on the `findOneAndUpdate` path too (this is what
 * `crudService.update` uses under the hood via `findByIdAndUpdate`, which
 * does NOT trigger `pre("save")` hooks).
 */
linkedProjectSchema.pre("findOneAndUpdate", function encryptApiKeyOnUpdate(next) {
  const update = this.getUpdate();
  if (update && update.apiKey) {
    update.apiKey = encrypt(update.apiKey);
  }
  next();
});

export default mongoose.model("LinkedProject", linkedProjectSchema);
