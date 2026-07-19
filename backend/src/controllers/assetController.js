const { randomUUID } = require("crypto");
const assetModel = require("../models/assetModel");
const { uploadImage, ensureUploadsBucketExists } = require("../lib/minio");

ensureUploadsBucketExists().catch((err) => console.error("Erreur init bucket uploads:", err));

async function uploadAsset(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "Format d'image non supporté (PNG, JPEG, WEBP uniquement)" });
  }

  try {
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectName = `${req.userId}/${randomUUID()}-${safeName}`;
    const url = await uploadImage(objectName, req.file.buffer, req.file.mimetype);

    const asset = await assetModel.create({ ownerId: req.userId, type: "uploaded_image", url });

    res.status(201).json({ asset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'upload" });
  }
}

async function listAssets(req, res) {
  try {
    const assets = await assetModel.findAllByOwner(req.userId, "uploaded_image");
    res.json({ assets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { uploadAsset, listAssets };