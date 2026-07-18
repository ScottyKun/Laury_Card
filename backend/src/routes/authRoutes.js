const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { loginLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/register", loginLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.get("/me", authMiddleware, authController.me);
router.put("/me", authMiddleware, authController.updateProfile);
router.put("/me/password", authMiddleware, authController.updatePassword);

module.exports = router;