const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getAll, getOne, create, update, remove } = require("../controllers/achievementController");

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", protect, authorize("admin", "editor"), create);
router.put("/:id", protect, authorize("admin", "editor"), update);
router.delete("/:id", protect, authorize("admin", "editor"), remove);

module.exports = router;
