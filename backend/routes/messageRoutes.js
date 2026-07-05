const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createMessage, getMessages, updateMessage, deleteMessage } = require("../controllers/messageController");

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, authorize("admin", "editor"), getMessages);
router.patch("/:id", protect, authorize("admin", "editor"), updateMessage);
router.delete("/:id", protect, authorize("admin", "editor"), deleteMessage);

module.exports = router;
