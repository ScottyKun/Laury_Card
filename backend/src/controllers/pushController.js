const pushSubscriptionModel = require("../models/pushSubscriptionModel");

async function subscribe(req, res) {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Abonnement push invalide" });
  }

  try {
    await pushSubscriptionModel.create({
      userId: req.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function unsubscribe(req, res) {
  const { endpoint } = req.body;
  try {
    await pushSubscriptionModel.removeByEndpoint(endpoint);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { subscribe, unsubscribe };