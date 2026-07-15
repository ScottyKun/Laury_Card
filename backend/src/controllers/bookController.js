const { randomUUID } = require("crypto");
const bookModel = require("../models/bookModel");
const shareModel = require("../models/shareModel");
const cardModel = require("../models/cardModel");
const { copyThumbnailByUrl } = require("../lib/minio");
const { PDFDocument } = require("pdf-lib");
const { minioClient, BUCKET } = require("../lib/minio");
const { deleteThumbnail } = require("../lib/minio");

async function createBook(req, res) {
  const { title } = req.body;
  try {
    const book = await bookModel.create({
      id: randomUUID(),
      ownerId: req.userId,
      title: title || "Livre sans titre",
    });
    res.status(201).json({ book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function listBooks(req, res) {
  try {
    const books = await bookModel.findAllByOwner(req.userId);
    res.json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getBook(req, res) {
  try {
    let book = await bookModel.findById(req.params.id, req.userId);
    let isOwner = !!book;

    if (!book) {
      const share = await shareModel.findShareForBook(req.params.id, req.userId);
      if (share) {
        book = await bookModel.findByIdAny(req.params.id);
        isOwner = false;
      }
    }

    if (!book) return res.status(404).json({ error: "Livre introuvable" });
    const pages = await bookModel.getPages(book.id);
    res.json({ book, pages, isOwner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateBook(req, res) {
  const { title, pages } = req.body;
  try {
    let book = await bookModel.findById(req.params.id, req.userId);

    if (!book) {
      const share = await shareModel.findShareForBook(req.params.id, req.userId);
      if (!share) return res.status(404).json({ error: "Livre introuvable" });
      book = await bookModel.findByIdAny(req.params.id);
    }

    if (title !== undefined) {
      await bookModel.updateTitleAny(req.params.id, title);
    }

    if (Array.isArray(pages)) {
      await bookModel.replacePages(req.params.id, pages);
      const updatedPages = await bookModel.getPages(req.params.id);
      const firstPage = updatedPages[0];
      if (firstPage?.thumbnail_url) {
        await bookModel.updateCover(req.params.id, firstPage.thumbnail_url, firstPage.width_px, firstPage.height_px);
      }
    }

    const updatedPages = await bookModel.getPages(req.params.id);
    const updatedBook = await bookModel.findByIdAny(req.params.id);
    res.json({ book: updatedBook, pages: updatedPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteBook(req, res) {
  try {
    const book = await bookModel.findById(req.params.id, req.userId);
    if (!book) return res.status(404).json({ error: "Livre introuvable" });

    const pages = await bookModel.getPages(book.id);

    await bookModel.remove(req.params.id, req.userId); // cascade automatique sur book_pages

    for (const page of pages) {
      const card = await cardModel.findByIdAny(page.card_id);
      if (!card || card.owner_id !== req.userId) continue; // ne touche jamais aux cartes d'un autre utilisateur

      const usedElsewhere = await bookModel.isCardUsedInOtherBook(page.card_id, book.id);
      if (usedElsewhere) continue; // la carte sert encore ailleurs, on la garde

      await cardModel.remove(page.card_id, req.userId);
      if (card.thumbnail_url) {
        await deleteThumbnail(`${req.userId}/${page.card_id}.png`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function duplicateBook(req, res) {
  try {
    const original = await bookModel.findById(req.params.id, req.userId);
    if (!original) return res.status(404).json({ error: "Livre introuvable" });

    const originalPages = await bookModel.getPages(original.id);
    const newBookId = randomUUID();
    const newBook = await bookModel.create({ id: newBookId, ownerId: req.userId, title: `${original.title} (copie)` });

    const newPages = [];
    for (const page of originalPages) {
      const originalCard = await cardModel.findByIdAny(page.card_id);
      if (!originalCard) continue;

      const newCardId = randomUUID();
      let newThumbnailUrl = null;
      if (originalCard.thumbnail_url) {
        newThumbnailUrl = await copyThumbnailByUrl(originalCard.thumbnail_url, `${req.userId}/${newCardId}.png`);
      }

      await cardModel.create({
        id: newCardId,
        ownerId: req.userId,
        title: `${originalCard.title} (copie de "${original.title}")`,
        canvasJson: originalCard.canvas_json,
        thumbnailUrl: newThumbnailUrl,
        format: originalCard.format,
        widthPx: originalCard.width_px,
        heightPx: originalCard.height_px,
      });

      newPages.push({
        cardId: newCardId,
        transitionType: page.transition_type,
        thumbnailUrl: newThumbnailUrl,
        widthPx: originalCard.width_px,
        heightPx: originalCard.height_px,
      });
    }

    if (newPages.length > 0) {
      await bookModel.replacePages(newBookId, newPages.map((p) => ({ cardId: p.cardId, transitionType: p.transitionType })));
      const cover = newPages[0];
      await bookModel.updateCover(newBookId, cover.thumbnailUrl, cover.widthPx, cover.heightPx);
    }

    res.status(201).json({ book: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getThumbnailBuffer(objectName) {
  const stream = await minioClient.getObject(BUCKET, objectName);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function extractObjectName(url) {
  const prefix = `http://localhost:9000/${BUCKET}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

async function exportBook(req, res) {
  try {
    let book = await bookModel.findById(req.params.id, req.userId);
    if (!book) {
      const share = await shareModel.findShareForBook(req.params.id, req.userId);
      if (!share) return res.status(404).json({ error: "Livre introuvable" });
      book = await bookModel.findByIdAny(req.params.id);
    }

    const pages = await bookModel.getPages(book.id);
    if (pages.length === 0) return res.status(400).json({ error: "Ce livre n'a aucune page" });

    const pdfDoc = await PDFDocument.create();

    for (const page of pages) {
      if (!page.thumbnail_url) continue;
      const objectName = extractObjectName(page.thumbnail_url);
      if (!objectName) continue;

      const imageBytes = await getThumbnailBuffer(objectName);
      const pngImage = await pdfDoc.embedPng(imageBytes);

      const pdfPage = pdfDoc.addPage([page.width_px, page.height_px]);
      pdfPage.drawImage(pngImage, { x: 0, y: 0, width: page.width_px, height: page.height_px });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${book.title}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'export" });
  }
}

module.exports = { createBook, listBooks, getBook, updateBook, deleteBook, duplicateBook, exportBook };