const pool = require("../db");

async function create({ id, ownerId, title }) {
  const result = await pool.query(
    "INSERT INTO books (id, owner_id, title) VALUES ($1, $2, $3) RETURNING *",
    [id, ownerId, title]
  );
  return result.rows[0];
}

async function findAllByOwner(ownerId) {
  const result = await pool.query(
    "SELECT * FROM books WHERE owner_id = $1 ORDER BY updated_at DESC",
    [ownerId]
  );
  return result.rows;
}

async function findById(id, ownerId) {
  const result = await pool.query("SELECT * FROM books WHERE id = $1 AND owner_id = $2", [id, ownerId]);
  return result.rows[0] || null;
}

async function updateTitle(id, ownerId, title) {
  const result = await pool.query(
    "UPDATE books SET title = $1, updated_at = now() WHERE id = $2 AND owner_id = $3 RETURNING *",
    [title, id, ownerId]
  );
  return result.rows[0] || null;
}

async function updateCover(id, coverUrl, widthPx, heightPx) {
  await pool.query(
    "UPDATE books SET cover_thumbnail_url = $1, cover_width_px = $2, cover_height_px = $3, updated_at = now() WHERE id = $4",
    [coverUrl, widthPx, heightPx, id]
  );
}

async function remove(id, ownerId) {
  const result = await pool.query("DELETE FROM books WHERE id = $1 AND owner_id = $2 RETURNING id", [id, ownerId]);
  return result.rows[0] || null;
}

// --- Pages ---

async function getPages(bookId) {
  const result = await pool.query(
    `SELECT bp.id, bp.position, bp.transition_type, bp.card_id,
            c.title AS card_title, c.thumbnail_url, c.width_px, c.height_px
     FROM book_pages bp
     JOIN cards c ON c.id = bp.card_id
     WHERE bp.book_id = $1
     ORDER BY bp.position ASC`,
    [bookId]
  );
  return result.rows;
}

async function replacePages(bookId, pages) {
  // pages = [{ cardId, transitionType }] dans l'ordre voulu
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM book_pages WHERE book_id = $1", [bookId]);

    for (let i = 0; i < pages.length; i++) {
      await client.query(
        `INSERT INTO book_pages (book_id, card_id, position, transition_type)
         VALUES ($1, $2, $3, $4)`,
        [bookId, pages[i].cardId, i, pages[i].transitionType || "fade"]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function findByIdAny(id) {
  const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function updateTitleAny(id, title) {
  const result = await pool.query(
    "UPDATE books SET title = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [title, id]
  );
  return result.rows[0] || null;
}

async function isCardUsedInOtherBook(cardId, excludeBookId) {
  const result = await pool.query(
    "SELECT 1 FROM book_pages WHERE card_id = $1 AND book_id != $2 LIMIT 1",
    [cardId, excludeBookId]
  );
  return result.rows.length > 0;
}

module.exports = {
  create, findAllByOwner, findById, findByIdAny, updateTitle, updateTitleAny, updateCover, remove,
  getPages, replacePages, isCardUsedInOtherBook,
};