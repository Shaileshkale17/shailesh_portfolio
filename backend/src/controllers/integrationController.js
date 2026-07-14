import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import githubIntegrationService from "../services/githubIntegrationService.js";
import leetcodeIntegrationService from "../services/leetcodeIntegrationService.js";
import IntegrationCache from "../models/IntegrationCache.js";
import { syncIntegrations } from "../cron/integrationSync.cron.js";

/**
 * Returns the cached snapshot for a provider if one exists (refreshed by
 * the cron job / sync endpoint); otherwise falls back to a live fetch so
 * the dashboard still works before the first sync has run.
 */
const getCachedOrLive = async (provider, liveFetch) => {
  const cached = await IntegrationCache.findOne({ provider });
  if (cached) return { ...cached.data, cachedAt: cached.updatedAt };
  return liveFetch();
};

/**
 * @desc    GitHub profile/repo/contribution stats
 * @route   GET /api/integrations/github
 * @access  Private (admin/editor)
 */
export const getGithubStats = asyncHandler(async (req, res) => {
  const data = await getCachedOrLive("github", () => githubIntegrationService.getProfile());
  ApiResponse.success(res, 200, "GitHub stats fetched successfully", data);
});

/**
 * @desc    LeetCode solved-problem/contest/streak stats
 * @route   GET /api/integrations/leetcode
 * @access  Private (admin/editor)
 */
export const getLeetcodeStats = asyncHandler(async (req, res) => {
  const data = await getCachedOrLive("leetcode", () => leetcodeIntegrationService.getProfile());
  ApiResponse.success(res, 200, "LeetCode stats fetched successfully", data);
});

/**
 * @desc    Manually re-sync all external integrations (GitHub, LeetCode,
 *          linked projects). Intended to be called by an external
 *          scheduler (e.g. Vercel Cron) when the app runs serverless and
 *          the in-process node-cron job can't run — see the README.
 * @route   POST /api/integrations/sync
 * @access  Private (admin), or via a shared `x-cron-secret` header (see authMiddleware.allowAdminOrCronSecret)
 */
export const triggerSync = asyncHandler(async (req, res) => {
  const results = await syncIntegrations();
  ApiResponse.success(res, 200, "Integrations synced", results);
});
