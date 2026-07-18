const express = require("express");
const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/", milestoneController.createMilestone);
router.get("/", milestoneController.listMilestones);
router.delete("/:id", milestoneController.deleteMilestone);

module.exports = router;