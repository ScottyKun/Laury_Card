const { randomUUID } = require("crypto");
const cardModel = require("../models/cardModel");
const shareModel = require("../models/shareModel");
const { uploadThumbnail, ensureBucketExists, copyThumbnailByUrl, deleteThumbnail } = require("../lib/minio");

ensureBucketExists().catch((err) => console.error("Erreur init bucket MinIO:", err));

function decodeThumbnail(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64, "base64");
}

async function createCard(req, res) {
  const { title, canvasJson, thumbnail, format, widthPx, heightPx } = req.body;

  if (!canvasJson || !format || !widthPx || !heightPx) {
    return res.status(400).json({ error: "Données de carte incomplètes" });
  }

  try {
    const id = randomUUID();

    let thumbnailUrl = null;
    if (thumbnail) {
      const buffer = decodeThumbnail(thumbnail);
      const objectName = `${req.userId}/${id}.png`; 
      thumbnailUrl = await uploadThumbnail(objectName, buffer);
    }

    const card = await cardModel.create({
      id,
      ownerId: req.userId,
      title: title || "Carte sans titre",
      canvasJson,
      thumbnailUrl,
      format,
      widthPx,
      heightPx,
    });

    res.status(201).json({ card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateCard(req, res) {
  const { id } = req.params;
  const { title, canvasJson, thumbnail, format, widthPx, heightPx } = req.body;

  try {
    let thumbnailUrl;
    if (thumbnail) {
      const buffer = decodeThumbnail(thumbnail);
      const objectName = `${req.userId}/${id}.png`;
      thumbnailUrl = await uploadThumbnail(objectName, buffer);
    }

    const card = await cardModel.update(id, req.userId, {
      title: title || "Carte sans titre",
      canvasJson,
      thumbnailUrl,
      format,
      widthPx,
      heightPx,
    });

    if (!card) return res.status(404).json({ error: "Carte introuvable" });
    res.json({ card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getCard(req, res) {
  try {
    let card = await cardModel.findById(req.params.id, req.userId);
    let isOwner = !!card;

    if (!card) {
      const share = await shareModel.findShareForCard(req.params.id, req.userId);
      if (share) {
        card = await cardModel.findByIdAny(req.params.id);
        isOwner = false;
      }
    }

    if (!card) return res.status(404).json({ error: "Carte introuvable" });
    res.json({ card, isOwner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function listCards(req, res) {
  try {
    const cards = await cardModel.findAllByOwner(req.userId);
    res.json({ cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteCard(req, res) {
  try {
    const card = await cardModel.findById(req.params.id, req.userId);
    if (!card) return res.status(404).json({ error: "Carte introuvable" });

    await cardModel.remove(req.params.id, req.userId);

    if (card.thumbnail_url) {
      const objectName = `${req.userId}/${req.params.id}.png`;
      await deleteThumbnail(objectName);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function duplicateCard(req, res) {
  try {
    const original = await cardModel.findById(req.params.id, req.userId);
    if (!original) return res.status(404).json({ error: "Carte introuvable" });

    const newId = randomUUID();

    let newThumbnailUrl = null;
    if (original.thumbnail_url) {
      const newObjectName = `${req.userId}/${newId}.png`;
      newThumbnailUrl = await copyThumbnailByUrl(original.thumbnail_url, newObjectName);
    }

    const newCard = await cardModel.create({
      id: newId,
      ownerId: req.userId,
      title: `${original.title} (copie)`,
      canvasJson: original.canvas_json,
      thumbnailUrl: newThumbnailUrl,
      format: original.format,
      widthPx: original.width_px,
      heightPx: original.height_px,
    });

    res.status(201).json({ card: newCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function forkCard(req, res) {
  try {
    const share = await shareModel.findShareForCard(req.params.id, req.userId);
    if (!share) return res.status(403).json({ error: "Vous n'avez pas accès à cette carte" });

    const original = await cardModel.findByIdAny(req.params.id);
    if (!original) return res.status(404).json({ error: "Carte introuvable" });

    const newId = randomUUID();
    let newThumbnailUrl = null;
    if (original.thumbnail_url) {
      const newObjectName = `${req.userId}/${newId}.png`;
      newThumbnailUrl = await copyThumbnailByUrl(original.thumbnail_url, newObjectName);
    }

    const forkedCard = await cardModel.create({
      id: newId,
      ownerId: req.userId,
      title: original.title,
      canvasJson: original.canvas_json,
      thumbnailUrl: newThumbnailUrl,
      format: original.format,
      widthPx: original.width_px,
      heightPx: original.height_px,
    });

    res.status(201).json({ card: forkedCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { createCard, updateCard, getCard, listCards, deleteCard, duplicateCard, forkCard };