const express = require("express");
const multer = require("multer");
const assetController = require("../controllers/assetController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }); // 8 Mo max

router.use(authMiddleware);
router.post("/", upload.single("image"), assetController.uploadAsset);
router.get("/", assetController.listAssets);

module.exports = router;