const express = require("express");
const pushController = require("../controllers/pushController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);
router.post("/subscribe", pushController.subscribe);
router.post("/unsubscribe", pushController.unsubscribe);

module.exports = router;