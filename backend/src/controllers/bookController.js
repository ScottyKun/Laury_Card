const { randomUUID } = require("crypto");
const bookModel = require("../models/bookModel");

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
    const book = await bookModel.findById(req.params.id, req.userId);
    if (!book) return res.status(404).json({ error: "Livre introuvable" });

    const pages = await bookModel.getPages(book.id);
    res.json({ book, pages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateBook(req, res) {
  const { title, pages } = req.body;
  try {
    const book = await bookModel.findById(req.params.id, req.userId);
    if (!book) return res.status(404).json({ error: "Livre introuvable" });

    if (title !== undefined) {
      await bookModel.updateTitle(req.params.id, req.userId, title);
    }

    if (Array.isArray(pages)) {
      await bookModel.replacePages(req.params.id, pages);

      // La miniature de couverture = celle de la 1ère page
      if (pages.length > 0) {
        const updatedPages = await bookModel.getPages(req.params.id);
        const firstPage = updatedPages[0];
        if (firstPage?.thumbnail_url) {
            await bookModel.updateCover(req.params.id, firstPage.thumbnail_url, firstPage.width_px, firstPage.height_px);
        }
      }
    }

    const updatedPages = await bookModel.getPages(req.params.id);
    const updatedBook = await bookModel.findById(req.params.id, req.userId);
    res.json({ book: updatedBook, pages: updatedPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteBook(req, res) {
  try {
    const deleted = await bookModel.remove(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: "Livre introuvable" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { createBook, listBooks, getBook, updateBook, deleteBook };