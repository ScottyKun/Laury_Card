const express = require("express");
const shareController = require("../controllers/shareController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/", shareController.createShare);
router.get("/inbox", shareController.getInbox);
router.get("/unread-count", shareController.getUnreadCount);
router.put("/:id/read", shareController.markShareRead);

module.exports = router;