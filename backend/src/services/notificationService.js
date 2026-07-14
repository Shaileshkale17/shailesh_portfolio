import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";

/**
 * Creates a notification. Called internally by other services
 * (messageService on new contact, analyticsService on visitor milestones,
 * linkedProjectService/cron on integration failures) — not exposed as a
 * public create route, since notifications are always system-generated.
 * @param {{ type: string, title: string, body?: string, meta?: object }} input
 */
const create = async ({ type, title, body, meta }) => Notification.create({ type, title, body, meta });

/**
 * Lists recent notifications, newest first, capped at 200 (a dashboard
 * bell doesn't need a full unbounded history — older ones stay in the DB
 * but aren't fetched by default).
 * @param {{ unreadOnly?: boolean }} [options]
 */
const getAll = async ({ unreadOnly = false } = {}) => {
  const filter = unreadOnly ? { read: false } : {};
  return Notification.find(filter).sort("-createdAt").limit(200);
};

/** Count of unread notifications, for a badge indicator. */
const getUnreadCount = async () => Notification.countDocuments({ read: false });

/** Marks a single notification as read. @throws {AppError} 404 if not found. */
const markRead = async (id) => {
  const doc = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  if (!doc) throw new AppError("Notification not found", 404);
  return doc;
};

/** Marks every unread notification as read. */
const markAllRead = async () => Notification.updateMany({ read: false }, { read: true });

/** Deletes a notification. @throws {AppError} 404 if not found. */
const remove = async (id) => {
  const doc = await Notification.findByIdAndDelete(id);
  if (!doc) throw new AppError("Notification not found", 404);
  return doc;
};

export default { create, getAll, getUnreadCount, markRead, markAllRead, remove };
