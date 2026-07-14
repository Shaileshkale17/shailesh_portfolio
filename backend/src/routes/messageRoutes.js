import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { createMessage, getMessages, exportMessages, updateMessage, deleteMessage } from "../controllers/messageController.js";

/**
 * Routes for /api/messages
 *
 * Submitting a message (contact form) is public; reading, exporting,
 * updating, and deleting messages (the admin inbox) requires an
 * authenticated admin/editor.
 */
const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, authorize("admin", "editor"), getMessages);
router.get("/export", protect, authorize("admin", "editor"), exportMessages);
router.patch("/:id", protect, authorize("admin", "editor"), updateMessage);
router.delete("/:id", protect, authorize("admin", "editor"), deleteMessage);

export default router;
