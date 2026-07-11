import express from "express";
import { login, getMe, register } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

/**
 * Routes for /api/auth
 *
 * `/register` is intentionally public so the very first admin account can
 * be created without needing auth — see the note on `authService.register`
 * about locking it down afterward.
 */
const router = express.Router();

router.post("/login", login);
router.post("/register", register); // NOTE: lock this down or remove after creating the first admin
router.get("/me", protect, getMe);

export default router;
