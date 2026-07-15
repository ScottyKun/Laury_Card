const pool = require("../db");

async function create({ senderId, recipientId, cardId, bookId }) {
  const result = await pool.query(
    `INSERT INTO shares (sender_id, recipient_id, card_id, book_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, recipientId, cardId || null, bookId || null]
  );
  return result.rows[0];
}

async function findInbox(userId) {
  const result = await pool.query(
    `SELECT
       s.id, s.status, s.created_at,
       s.card_id, s.book_id,
       sender.first_name AS sender_first_name,
       c.title AS card_title, c.thumbnail_url AS card_thumbnail_url,
       c.width_px AS card_width_px, c.height_px AS card_height_px,
       b.title AS book_title, b.cover_thumbnail_url AS book_thumbnail_url
     FROM shares s
     JOIN users sender ON sender.id = s.sender_id
     LEFT JOIN cards c ON c.id = s.card_id
     LEFT JOIN books b ON b.id = s.book_id
     WHERE s.recipient_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function countUnread(userId) {
  const result = await pool.query(
    "SELECT COUNT(*) FROM shares WHERE recipient_id = $1 AND status = 'unread'",
    [userId]
  );
  return Number(result.rows[0].count);
}

async function markRead(id, userId) {
  const result = await pool.query(
    "UPDATE shares SET status = 'read' WHERE id = $1 AND recipient_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0] || null;
}

async function findShareForCard(cardId, recipientId) {
  const result = await pool.query(
    "SELECT id FROM shares WHERE card_id = $1 AND recipient_id = $2 LIMIT 1",
    [cardId, recipientId]
  );
  return result.rows[0] || null;
}

async function findShareForBook(bookId, recipientId) {
  const result = await pool.query(
    "SELECT id FROM shares WHERE book_id = $1 AND recipient_id = $2 LIMIT 1",
    [bookId, recipientId]
  );
  return result.rows[0] || null;
}

module.exports = { create, findInbox, countUnread, markRead, findShareForCard, findShareForBook };