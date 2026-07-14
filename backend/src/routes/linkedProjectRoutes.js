import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import linkedProjectController from "../controllers/linkedProjectController.js";

const { getAll, getOne, create, update, remove, sync } = linkedProjectController;

/**
 * Routes for /api/linked-projects
 *
 * Entirely private — these records hold third-party API credentials and
 * are only ever consumed by the admin dashboard itself, never the public
 * portfolio site.
 */
const router = express.Router();

router.use(protect, authorize("admin", "editor"));

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.post("/:id/sync", sync);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
