const notificationModel = require("../models/notificationModel");

async function getNotifications(req, res) {
  try {
    const notifications = await notificationModel.findAllByUser(req.userId);
    // Retire le tag technique [[milestoneId]] avant d'envoyer au frontend
    const cleaned = notifications.map((n) => ({ ...n, message: n.message.replace(/\[\[.*?\]\]\s*/, "") }));
    res.json({ notifications: cleaned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getUnreadCount(req, res) {
  try {
    const count = await notificationModel.countUnread(req.userId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function markNotificationRead(req, res) {
  try {
    const notif = await notificationModel.markRead(req.params.id, req.userId);
    if (!notif) return res.status(404).json({ error: "Notification introuvable" });
    res.json({ notification: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getNotifications, getUnreadCount, markNotificationRead };