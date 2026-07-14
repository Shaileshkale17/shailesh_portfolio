import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import notificationService from "../services/notificationService.js";

/**
 * @desc    List notifications, newest first (optionally unread-only)
 * @route   GET /api/notifications?unread=true
 * @access  Private (admin/editor)
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const docs = await notificationService.getAll({ unreadOnly: req.query.unread === "true" });
  ApiResponse.success(res, 200, "Notifications fetched successfully", docs);
});

/**
 * @desc    Unread notification count, for a bell badge
 * @route   GET /api/notifications/unread-count
 * @access  Private (admin/editor)
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount();
  ApiResponse.success(res, 200, "Unread notification count fetched successfully", { count });
});

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (admin/editor)
 */
export const markRead = asyncHandler(async (req, res) => {
  const doc = await notificationService.markRead(req.params.id);
  ApiResponse.success(res, 200, "Notification marked as read", doc);
});

/**
 * @desc    Mark every unread notification as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private (admin/editor)
 */
export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead();
  ApiResponse.success(res, 200, "All notifications marked as read", null);
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (admin/editor)
 */
export const removeNotification = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id);
  ApiResponse.success(res, 200, "Notification deleted successfully", { id: req.params.id });
});
