const pool = require("../db");

async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

async function create({ firstName, email, passwordHash }) {
  const result = await pool.query(
    "INSERT INTO users (first_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, first_name, email, created_at",
    [firstName, email, passwordHash]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query("SELECT id, first_name, email, created_at FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function updateProfile(id, { firstName, email }) {
  const result = await pool.query(
    "UPDATE users SET first_name = $1, email = $2 WHERE id = $3 RETURNING id, first_name, email, created_at",
    [firstName, email, id]
  );
  return result.rows[0];
}

async function updatePassword(id, passwordHash) {
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
}

module.exports = { findByEmail, create, findById, updateProfile, updatePassword };