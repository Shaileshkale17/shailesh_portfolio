import Message from "../models/Message.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { escapeRegex } from "../utils/text.js";
import mailService from "./mailService.js";
import notificationService from "./notificationService.js";

/**
 * Creates a new contact-form message, then fires three best-effort side
 * effects: an email alert to the site owner, an auto-reply to the sender,
 * and an in-app notification. All three are wrapped so a failure in any
 * of them (bad SMTP config, network blip) never fails the submission
 * itself — the message is already saved by the time they run.
 * @param {{ name: string, email: string, message: string }} input
 */
const createMessage = async ({ name, email, message }) => {
  const doc = await Message.create({ name, email, message });

  const [adminNotified, autoReplySent] = await Promise.all([
    mailService.sendAdminNewMessageAlert({ name, email, message }).catch((err) => {
      logger.error("Failed to send admin new-message alert", err);
      return false;
    }),
    mailService.sendAutoReply({ name, email }).catch((err) => {
      logger.error("Failed to send auto-reply", err);
      return false;
    }),
    notificationService
      .create({
        type: "new_message",
        title: `New message from ${name}`,
        body: message.slice(0, 140),
        meta: { messageId: doc._id },
      })
      .catch((err) => logger.error("Failed to create notification for new message", err)),
  ]);

  doc.emailStatus = { adminNotified, autoReplySent };
  await doc.save();

  return doc;
};

/**
 * Fetches messages for the admin inbox, newest first, optionally narrowed
 * by a read/unread filter and/or a case-insensitive search across
 * name/email/message. Always returns a plain array (no pagination
 * wrapper) to stay compatible with existing callers.
 * @param {{ search?: string, read?: string }} [filters]
 */
const getMessages = async ({ search, read } = {}) => {
  const filter = {};

  if (read === "true" || read === "false") {
    filter.read = read === "true";
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { email: regex }, { message: regex }];
  }

  return Message.find(filter).sort("-createdAt");
};

/**
 * Updates a message (typically to toggle `read`).
 * @throws {AppError} 404 if the message doesn't exist.
 */
const updateMessage = async (id, data) => {
  const doc = await Message.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new AppError("Message not found", 404);
  return doc;
};

/**
 * Deletes a message.
 * @throws {AppError} 404 if the message doesn't exist.
 */
const deleteMessage = async (id) => {
  const doc = await Message.findByIdAndDelete(id);
  if (!doc) throw new AppError("Message not found", 404);
  return doc;
};

export default { createMessage, getMessages, updateMessage, deleteMessage };
