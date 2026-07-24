const notificationModel = require("../models/notificationModel");
const pushSubscriptionModel = require("../models/pushSubscriptionModel");
const webpush = require("web-push");

let io = null;

function attachSocketServer(socketIoInstance) {
  io = socketIoInstance;
}

async function sendPushToUser(userId, payload) {
  const subscriptions = await pushSubscriptionModel.findAllByUser(userId);

  for (const sub of subscriptions) {
    const pushConfig = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
    };

    try {
      await webpush.sendNotification(pushConfig, JSON.stringify(payload));
    } catch (err) {
      const statusCode = err.statusCode;
      const shortEndpoint = sub.endpoint.slice(-30); // juste la fin, pour identifier sans polluer les logs

      // 404/410 : abonnement définitivement mort (désinstallation, expiration) -> nettoyage silencieux normal
      // 400/401/403 : payload ou clés VAPID invalides pour CET abonnement -> aussi à nettoyer, mais on log pour comprendre
      if ([404, 410].includes(statusCode)) {
        await pushSubscriptionModel.remove(sub.id);
      } else if ([400, 401, 403].includes(statusCode)) {
        console.error(`Web Push rejeté (${statusCode}) pour ...${shortEndpoint} — abonnement supprimé. Détail:`, err.body || err.message);
        await pushSubscriptionModel.remove(sub.id);
      } else {
        // Erreur transitoire (réseau, timeout, 5xx) : on garde l'abonnement, ça peut réussir la prochaine fois
        console.error(`Erreur Web Push (${statusCode || "réseau"}) pour ...${shortEndpoint}:`, err.body || err.message);
      }
    }
  }
}

async function notifyUser({ userId, type, message, cardId, bookId }) {
  const notification = await notificationModel.create({ userId, type, message, cardId, bookId });

  // Canal 1 : temps réel si l'utilisateur a un onglet ouvert
  const delivered = io?.to(`user:${userId}`).emit("notification:new", {
    id: notification.id,
    type: notification.type,
    message: message.replace(/\[\[.*?\]\]\s*/, ""),
    card_id: notification.card_id,
    book_id: notification.book_id,
    read: false,
    created_at: notification.created_at,
  });

  // Canal 2 : Web Push, système, même app fermée
  await sendPushToUser(userId, {
    title: "Cartes&Mots",
    body: message.replace(/\[\[.*?\]\]\s*/, ""),
  });

  // Le fallback base est déjà assuré : la notification existe en base
  // dans tous les cas, donc récupérable à la reconnexion via GET /notifications

  return notification;
}

module.exports = { attachSocketServer, notifyUser };