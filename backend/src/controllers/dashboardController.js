import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import dashboardService from "../services/dashboardService.js";

/**
 * @desc    Aggregated overview numbers for the dashboard's top-level cards
 *          (analytics summary, contact counts, project counts, notifications)
 * @route   GET /api/dashboard/summary
 * @access  Private (admin/editor)
 */
export const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  ApiResponse.success(res, 200, "Dashboard summary fetched successfully", data);
});
