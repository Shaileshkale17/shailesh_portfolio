const express = require("express");
const { login, getMe, register } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register", register); // NOTE: lock this down or remove after creating the first admin
router.get("/me", protect, getMe);

module.exports = router;
