import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { track, getSummary } from "../controllers/analyticsController.js";

/**
 * Routes for /api/analytics
 *
 * `/track` is public — the portfolio's public frontend calls it on every
 * page view/engagement click. `/summary` (the dashboard's Analytics
 * section) requires an authenticated admin/editor.
 */
const router = express.Router();

router.post("/track", track);
router.get("/summary", protect, authorize("admin", "editor"), getSummary);

export default router;
