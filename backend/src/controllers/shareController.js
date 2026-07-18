const shareModel = require("../models/shareModel");
const userModel = require("../models/userModel");
const cardModel = require("../models/cardModel");
const bookModel = require("../models/bookModel");
const { notifyUser } = require("../services/notificationService");

async function createShare(req, res) {
  const { recipientEmail, cardId, bookId } = req.body;

  if (!recipientEmail || (!cardId && !bookId)) {
    return res.status(400).json({ error: "Email du destinataire et carte ou livre requis" });
  }

  try {
    const recipient = await userModel.findByEmail(recipientEmail);
    if (!recipient) return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email" });
    if (recipient.id === req.userId) return res.status(400).json({ error: "Vous ne pouvez pas vous partager une carte à vous-même" });

    let title = "";
    if (cardId) {
      const card = await cardModel.findById(cardId, req.userId);
      if (!card) return res.status(404).json({ error: "Carte introuvable" });
      title = card.title;
    }
    if (bookId) {
      const book = await bookModel.findById(bookId, req.userId);
      if (!book) return res.status(404).json({ error: "Livre introuvable" });
      title = book.title;
    }

    const share = await shareModel.create({ senderId: req.userId, recipientId: recipient.id, cardId, bookId });

    const sender = await userModel.findById(req.userId);
    const itemType = cardId ? "une carte" : "un livre";
    await notifyUser({
      userId: recipient.id,
      type: cardId ? "share_card" : "share_book",
      message: `${sender.first_name} vous a partagé ${itemType} « ${title} »`,
      cardId,
      bookId,
    });

    res.status(201).json({ share });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}



module.exports = { createShare};