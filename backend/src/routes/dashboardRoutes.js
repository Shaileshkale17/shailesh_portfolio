import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getSummary } from "../controllers/dashboardController.js";

/**
 * Routes for /api/dashboard
 */
const router = express.Router();

router.get("/summary", protect, authorize("admin", "editor"), getSummary);

export default router;
