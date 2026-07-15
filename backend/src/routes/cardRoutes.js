const express = require("express");
const cardController = require("../controllers/cardController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // toutes les routes cards nécessitent d'être connecté

router.post("/", cardController.createCard);
router.put("/:id", cardController.updateCard);
router.get("/", cardController.listCards);
router.get("/:id", cardController.getCard);
router.delete("/:id", cardController.deleteCard);
router.post("/:id/duplicate", cardController.duplicateCard);
router.post("/:id/fork", cardController.forkCard);

module.exports = router;