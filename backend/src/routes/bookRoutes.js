const express = require("express");
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/", bookController.createBook);
router.get("/", bookController.listBooks);
router.get("/:id", bookController.getBook);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);
router.post("/:id/duplicate", bookController.duplicateBook);
router.get("/:id/export", bookController.exportBook);

module.exports = router;