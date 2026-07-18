const pool = require("../db");

async function create({ userId, type, message, cardId, bookId }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, message, card_id, book_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, message, cardId || null, bookId || null]
  );
  return result.rows[0];
}

async function findAllByUser(userId) {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
    [userId]
  );
  return result.rows;
}

async function countUnread(userId) {
  const result = await pool.query(
    "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false",
    [userId]
  );
  return Number(result.rows[0].count);
}

async function markRead(id, userId) {
  const result = await pool.query(
    "UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0] || null;
}

async function findLastByType(userId, type) {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT 1",
    [userId, type]
  );
  return result.rows[0] || null;
}

async function existsTodayForMilestone(userId, milestoneId, dateStr) {
  const result = await pool.query(
    `SELECT 1 FROM notifications
     WHERE user_id = $1 AND type = 'milestone' AND message LIKE $2
     AND created_at::date = $3::date LIMIT 1`,
    [userId, `%[[${milestoneId}]]%`, dateStr]
  );
  return result.rows.length > 0;
}

module.exports = { create, findAllByUser, countUnread, markRead, findLastByType, existsTodayForMilestone };