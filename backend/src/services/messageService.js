import Message from "../models/Message.js";
import AppError from "../utils/AppError.js";

/**
 * Creates a new contact-form message.
 * @param {{ name: string, email: string, message: string }} input
 */
const createMessage = async ({ name, email, message }) => Message.create({ name, email, message });

/** Fetches all messages, newest first, for the admin inbox. */
const getMessages = async () => Message.find().sort("-createdAt");

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
