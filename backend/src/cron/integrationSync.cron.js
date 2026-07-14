import cron from "node-cron";
import githubIntegrationService from "../services/githubIntegrationService.js";
import leetcodeIntegrationService from "../services/leetcodeIntegrationService.js";
import linkedProjectService from "../services/linkedProjectService.js";
import notificationService from "../services/notificationService.js";
import IntegrationCache from "../models/IntegrationCache.js";
import logger from "../utils/logger.js";

/**
 * Refreshes cached GitHub/LeetCode stats and re-syncs every enabled linked
 * project. Each integration runs independently (own try/catch) so one
 * failure — e.g. a GitHub rate limit — doesn't prevent the others from
 * updating.
 *
 * Called both by the in-process schedule below (`startIntegrationCron`,
 * for long-running deployments) and by `POST /api/integrations/sync` (for
 * serverless deployments driven by an external scheduler like Vercel
 * Cron — see the README for wiring that up).
 *
 * @returns {Promise<{ github: string, leetcode: string, linkedProjects: string|number }>}
 */
export const syncIntegrations = async () => {
  const results = { github: null, leetcode: null, linkedProjects: null };

  try {
    const data = await githubIntegrationService.getProfile();
    await IntegrationCache.findOneAndUpdate(
      { provider: "github" },
      { data, updatedAt: new Date() },
      { upsert: true }
    );
    results.github = "ok";
  } catch (err) {
    logger.error("GitHub integration sync failed", err);
    results.github = "failed";
    await notificationService
      .create({ type: "integration_failed", title: "GitHub sync failed", body: err.message })
      .catch((notifyErr) => logger.error("Failed to create integration_failed notification", notifyErr));
  }

  try {
    const data = await leetcodeIntegrationService.getProfile();
    await IntegrationCache.findOneAndUpdate(
      { provider: "leetcode" },
      { data, updatedAt: new Date() },
      { upsert: true }
    );
    results.leetcode = "ok";
  } catch (err) {
    logger.error("LeetCode integration sync failed", err);
    results.leetcode = "failed";
    await notificationService
      .create({ type: "integration_failed", title: "LeetCode sync failed", body: err.message })
      .catch((notifyErr) => logger.error("Failed to create integration_failed notification", notifyErr));
  }

  try {
    const synced = await linkedProjectService.syncAll();
    results.linkedProjects = synced.length;
  } catch (err) {
    logger.error("Linked project sync failed", err);
    results.linkedProjects = "failed";
  }

  return results;
};

/**
 * Schedules `syncIntegrations` to run periodically (hourly by default,
 * configurable via `INTEGRATION_SYNC_CRON`). Only meaningful for
 * long-running processes (a traditional Node server, PM2, Docker, etc.) —
 * on Vercel's serverless runtime the process doesn't stay alive between
 * requests, so `index.js` skips calling this there in favor of the
 * HTTP-triggered sync endpoint instead (`integrationController.triggerSync`).
 */
export const startIntegrationCron = () => {
  const schedule = process.env.INTEGRATION_SYNC_CRON || "0 * * * *"; // hourly

  cron.schedule(schedule, () => {
    logger.info("Running scheduled integration sync");
    syncIntegrations().catch((err) => logger.error("Scheduled integration sync crashed", err));
  });

  logger.info(`Integration sync cron scheduled: "${schedule}"`);
};
