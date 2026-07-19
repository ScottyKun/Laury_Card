const pool = require("../db");
const bcrypt = require("bcrypt");

async function create(userId, code) {
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query("DELETE FROM mfa_codes WHERE user_id = $1", [userId]); // invalide les anciens codes
  await pool.query(
    "INSERT INTO mfa_codes (user_id, code_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, codeHash, expiresAt]
  );
}

async function verify(userId, code) {
  const result = await pool.query(
    "SELECT * FROM mfa_codes WHERE user_id = $1 AND used = false AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  const record = result.rows[0];
  if (!record) return false;

  const match = await bcrypt.compare(code, record.code_hash);
  if (!match) return false;

  await pool.query("UPDATE mfa_codes SET used = true WHERE id = $1", [record.id]);
  return true;
}

module.exports = { create, verify };