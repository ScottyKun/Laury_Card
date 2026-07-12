const pool = require("../db");

async function create({ ownerId, type, url }) {
  const result = await pool.query(
    "INSERT INTO assets (owner_id, type, url) VALUES ($1, $2, $3) RETURNING *",
    [ownerId, type, url]
  );
  return result.rows[0];
}

async function findAllByOwner(ownerId, type) {
  const result = await pool.query(
    "SELECT * FROM assets WHERE owner_id = $1 AND type = $2 ORDER BY created_at DESC",
    [ownerId, type]
  );
  return result.rows;
}

module.exports = { create, findAllByOwner };