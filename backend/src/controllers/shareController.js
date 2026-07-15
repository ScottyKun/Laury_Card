const shareModel = require("../models/shareModel");
const userModel = require("../models/userModel");
const cardModel = require("../models/cardModel");
const bookModel = require("../models/bookModel");

async function createShare(req, res) {
  const { recipientEmail, cardId, bookId } = req.body;

  if (!recipientEmail || (!cardId && !bookId)) {
    return res.status(400).json({ error: "Email du destinataire et carte ou livre requis" });
  }

  try {
    const recipient = await userModel.findByEmail(recipientEmail);
    if (!recipient) {
      return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email" });
    }
    if (recipient.id === req.userId) {
      return res.status(400).json({ error: "Vous ne pouvez pas vous partager une carte à vous-même" });
    }

    // Vérifie que l'expéditeur possède bien l'élément partagé
    if (cardId) {
      const card = await cardModel.findById(cardId, req.userId);
      if (!card) return res.status(404).json({ error: "Carte introuvable" });
    }
    if (bookId) {
      const book = await bookModel.findById(bookId, req.userId);
      if (!book) return res.status(404).json({ error: "Livre introuvable" });
    }

    const share = await shareModel.create({
      senderId: req.userId,
      recipientId: recipient.id,
      cardId,
      bookId,
    });

    res.status(201).json({ share });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getInbox(req, res) {
  try {
    const shares = await shareModel.findInbox(req.userId);
    res.json({ shares });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getUnreadCount(req, res) {
  try {
    const count = await shareModel.countUnread(req.userId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function markShareRead(req, res) {
  try {
    const share = await shareModel.markRead(req.params.id, req.userId);
    if (!share) return res.status(404).json({ error: "Partage introuvable" });
    res.json({ share });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { createShare, getInbox, getUnreadCount, markShareRead };