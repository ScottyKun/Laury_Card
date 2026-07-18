const pool = require("../db");

async function create({ id, ownerId, label, startDate, minorFrequency, minorDay }) {
  const result = await pool.query(
    `INSERT INTO milestones (id, owner_id, label, start_date, minor_frequency, minor_day)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, ownerId, label, startDate, minorFrequency, minorDay]
  );
  return result.rows[0];
}

async function findAllByOwner(ownerId) {
  const result = await pool.query("SELECT * FROM milestones WHERE owner_id = $1 ORDER BY created_at ASC", [ownerId]);
  return result.rows;
}

async function findAllGlobal() {
  const result = await pool.query("SELECT * FROM milestones");
  return result.rows;
}

async function remove(id, ownerId) {
  const result = await pool.query("DELETE FROM milestones WHERE id = $1 AND owner_id = $2 RETURNING id", [id, ownerId]);
  return result.rows[0] || null;
}

module.exports = { create, findAllByOwner, findAllGlobal, remove };