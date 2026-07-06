import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import statsController from "../controllers/statsController.js";
const { getAll, getOne, create, update, remove } = statsController;

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", protect, authorize("admin", "editor"), create);
router.put("/:id", protect, authorize("admin", "editor"), update);
router.delete("/:id", protect, authorize("admin", "editor"), remove);

export default router;
