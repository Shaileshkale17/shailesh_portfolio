import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import linkedProjectService from "../services/linkedProjectService.js";
import genericController from "./genericController.js";

const base = genericController(linkedProjectService, {
  resourceName: "Linked project",
  requiredFieldsOnCreate: ["name", "url"],
});

/**
 * @desc    Trigger a live analytics sync for one linked project
 * @route   POST /api/linked-projects/:id/sync
 * @access  Private (admin/editor)
 */
const sync = asyncHandler(async (req, res) => {
  const project = await linkedProjectService.sync(req.params.id);
  ApiResponse.success(res, 200, "Linked project synced", project);
});

export default { ...base, sync };
