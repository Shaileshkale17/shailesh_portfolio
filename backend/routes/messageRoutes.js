import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createMessage, getMessages, updateMessage, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, authorize("admin", "editor"), getMessages);
router.patch("/:id", protect, authorize("admin", "editor"), updateMessage);
router.delete("/:id", protect, authorize("admin", "editor"), deleteMessage);

export default router;
