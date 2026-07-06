import express from "express";
import { login, getMe, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register); // NOTE: lock this down or remove after creating the first admin
router.get("/me", protect, getMe);

export default router;
