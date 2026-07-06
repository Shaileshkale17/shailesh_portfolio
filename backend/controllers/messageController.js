import asyncHandler from "../utils/asyncHandler.js";
import Message from "../models/Message.js";

// @desc    Submit a contact-form message
// @route   POST /api/messages
// @access  Public
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email, and message are all required");
  }
  const doc = await Message.create({ name, email, message });
  res.status(201).json({ message: "Message received. Typical response time is 24-48 hours.", id: doc._id });
});

// @desc    List all messages (admin inbox)
// @route   GET /api/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const docs = await Message.find().sort("-createdAt");
  res.json(docs);
});

// @desc    Mark a message read/unread
// @route   PATCH /api/messages/:id
// @access  Private
export const updateMessage = asyncHandler(async (req, res) => {
  const doc = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) {
    res.status(404);
    throw new Error("Message not found");
  }
  res.json(doc);
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const doc = await Message.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error("Message not found");
  }
  res.json({ message: "Message removed", id: req.params.id });
});
