const pool = require("../db");

async function create({ userId, endpoint, p256dh, auth }) {
  const result = await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = $1
     RETURNING *`,
    [userId, endpoint, p256dh, auth]
  );
  return result.rows[0];
}

async function findAllByUser(userId) {
  const result = await pool.query("SELECT * FROM push_subscriptions WHERE user_id = $1", [userId]);
  return result.rows;
}

async function remove(id) {
  await pool.query("DELETE FROM push_subscriptions WHERE id = $1", [id]);
}

async function removeByEndpoint(endpoint) {
  await pool.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [endpoint]);
}

module.exports = { create, findAllByUser, remove, removeByEndpoint };