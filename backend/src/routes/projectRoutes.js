import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import projectController from "../controllers/projectController.js";

const { getAll, getOne, create, update, remove } = projectController;

/**
 * Routes for /api/projects
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
