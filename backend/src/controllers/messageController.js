import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { validateRequiredFields } from "../utils/validators.js";
import messageService from "../services/messageService.js";

/**
 * @desc    Submit a contact-form message
 * @route   POST /api/messages
 * @access  Public
 */
export const createMessage = asyncHandler(async (req, res) => {
  validateRequiredFields(req.body, ["name", "email", "message"]);

  const doc = await messageService.createMessage(req.body);
  ApiResponse.success(res, 201, "Message received. Typical response time is 24-48 hours.", { id: doc._id });
});

/**
 * @desc    List all messages (admin inbox)
 * @route   GET /api/messages
 * @access  Private (admin/editor)
 */
export const getMessages = asyncHandler(async (req, res) => {
  const docs = await messageService.getMessages();
  ApiResponse.success(res, 200, "Messages fetched successfully", docs);
});

/**
 * @desc    Update a message (e.g. mark read/unread)
 * @route   PATCH /api/messages/:id
 * @access  Private (admin/editor)
 */
export const updateMessage = asyncHandler(async (req, res) => {
  const doc = await messageService.updateMessage(req.params.id, req.body);
  ApiResponse.success(res, 200, "Message updated successfully", doc);
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private (admin/editor)
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  await messageService.deleteMessage(req.params.id);
  ApiResponse.success(res, 200, "Message deleted successfully", { id: req.params.id });
});
