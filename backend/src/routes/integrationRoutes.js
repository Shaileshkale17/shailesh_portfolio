import express from "express";
import { protect, authorize, allowAdminOrCronSecret } from "../middlewares/authMiddleware.js";
import { getGithubStats, getLeetcodeStats, triggerSync } from "../controllers/integrationController.js";

/**
 * Routes for /api/integrations
 */
const router = express.Router();

router.get("/github", protect, authorize("admin", "editor"), getGithubStats);
router.get("/leetcode", protect, authorize("admin", "editor"), getLeetcodeStats);
// Admin-triggered from the dashboard, or scheduler-triggered via a shared secret — see allowAdminOrCronSecret.
router.post("/sync", allowAdminOrCronSecret, triggerSync);

export default router;
