const pool = require("../db");

async function create({ id, ownerId, title, canvasJson, thumbnailUrl, format, widthPx, heightPx }) {
  const result = await pool.query(
    `INSERT INTO cards (id, owner_id, title, canvas_json, thumbnail_url, format, width_px, height_px)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, ownerId, title, canvasJson, thumbnailUrl, format, widthPx, heightPx]
  );
  return result.rows[0];
}

async function update(id, ownerId, { title, canvasJson, thumbnailUrl, format, widthPx, heightPx }) {
  const result = await pool.query(
    `UPDATE cards
     SET title = $1, canvas_json = $2, thumbnail_url = $3, format = $4,
         width_px = $5, height_px = $6, updated_at = now()
     WHERE id = $7 AND owner_id = $8
     RETURNING *`,
    [title, canvasJson, thumbnailUrl, format, widthPx, heightPx, id, ownerId]
  );
  return result.rows[0] || null;
}

async function findById(id, ownerId) {
  const result = await pool.query("SELECT * FROM cards WHERE id = $1 AND owner_id = $2", [id, ownerId]);
  return result.rows[0] || null;
}

async function findAllByOwner(ownerId) {
  const result = await pool.query(
    `SELECT id, title, thumbnail_url, format, width_px, height_px, updated_at
     FROM cards WHERE owner_id = $1 ORDER BY updated_at DESC`,
    [ownerId]
  );
  return result.rows;
}

async function remove(id, ownerId) {
  const result = await pool.query("DELETE FROM cards WHERE id = $1 AND owner_id = $2 RETURNING id", [id, ownerId]);
  return result.rows[0] || null;
}

module.exports = { create, update, findById, findAllByOwner, remove };