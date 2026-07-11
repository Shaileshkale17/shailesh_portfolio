import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import experienceController from "../controllers/experienceController.js";

const { getAll, getOne, create, update, remove } = experienceController;

/**
 * Routes for /api/experience
 *
 * Reads are public (frontend site fetches this to render the portfolio).
 * Writes require a logged-in admin/editor via the `protect` + `authorize`
 * middleware chain. This file only wires paths to handlers — all logic
 * lives in the controller/service layers.
 */
const router = express.Router();

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", protect, authorize("admin", "editor"), create);
router.put("/:id", protect, authorize("admin", "editor"), update);
router.delete("/:id", protect, authorize("admin", "editor"), remove);

export default router;
