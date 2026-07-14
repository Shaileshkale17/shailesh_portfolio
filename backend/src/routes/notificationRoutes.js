import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  removeNotification,
} from "../controllers/notificationController.js";

/**
 * Routes for /api/notifications — entirely private (admin dashboard bell).
 */
const router = express.Router();

router.use(protect, authorize("admin", "editor"));

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
router.delete("/:id", removeNotification);

export default router;
