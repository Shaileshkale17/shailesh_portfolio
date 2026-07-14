import LinkedProject from "../models/LinkedProject.js";
import crudService from "./crudService.js";
import { decrypt } from "../utils/crypto.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import notificationService from "./notificationService.js";

const base = crudService(LinkedProject, { sortBy: "-createdAt" });

/**
 * Fetches live stats from a linked project's `analyticsEndpoint` and
 * caches the result on the document (`lastStats`/`lastSyncedAt`).
 *
 * Never throws to the caller on a failed fetch — a single unreachable
 * project shouldn't break the rest of the dashboard. Instead the error is
 * recorded on the document (`lastSyncError`) and an "integration_failed"
 * notification is raised.
 * @param {string} id
 * @throws {AppError} 404 if not found, 400 if disabled or has no endpoint configured.
 */
const sync = async (id) => {
  const project = await LinkedProject.findById(id).select("+apiKey");
  if (!project) throw new AppError("Linked project not found", 404);
  if (!project.enabled) throw new AppError("Cannot sync a disabled project", 400);
  if (!project.analyticsEndpoint) throw new AppError("This project has no analytics endpoint configured", 400);

  try {
    const rawKey = project.apiKey ? decrypt(project.apiKey) : null;

    const response = await fetch(project.analyticsEndpoint, {
      headers: rawKey ? { Authorization: `Bearer ${rawKey}` } : {},
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Upstream responded with ${response.status}`);

    project.lastStats = await response.json();
    project.lastSyncedAt = new Date();
    project.lastSyncError = null;
    await project.save();
    return project;
  } catch (err) {
    logger.error(`Failed to sync linked project "${project.name}"`, err);

    project.lastSyncError = err.message;
    project.lastSyncedAt = new Date();
    await project.save();

    await notificationService
      .create({ type: "integration_failed", title: `Sync failed: ${project.name}`, body: err.message })
      .catch((notifyErr) => logger.error("Failed to create integration_failed notification", notifyErr));

    return project;
  }
};

/** Syncs every enabled linked project that has an analytics endpoint configured. Used by the cron job. */
const syncAll = async () => {
  const projects = await LinkedProject.find({ enabled: true, analyticsEndpoint: { $exists: true, $ne: "" } });
  return Promise.all(projects.map((project) => sync(project._id)));
};

export default { ...base, sync, syncAll };
