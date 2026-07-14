import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import analyticsService from "../services/analyticsService.js";

/**
 * @desc    Records a pageview or engagement event from the public site
 * @route   POST /api/analytics/track
 * @access  Public
 */
export const track = asyncHandler(async (req, res) => {
  await analyticsService.track(req.body, req);
  // 202: accepted — fired from every page load/click, the client never needs the
  // created document back, so there's nothing worth returning in `data`.
  ApiResponse.success(res, 202, "Tracked", null);
});

/**
 * @desc    Full analytics summary for the dashboard (visitors, growth, top
 *          pages, country/device/browser breakdowns, referrers, portfolio events)
 * @route   GET /api/analytics/summary
 * @access  Private (admin/editor)
 */
export const getSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSummary();
  ApiResponse.success(res, 200, "Analytics summary fetched successfully", data);
});
