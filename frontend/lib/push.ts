const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(vapidPublicKey: string): Promise<{ success: boolean; reason?: string }> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, reason: "Ce navigateur ne supporte pas les notifications système." };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, reason: "Permission refusée." };
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(subscription.toJSON()),
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      reason: "Les notifications système ne sont pas disponibles sur ce navigateur (paramètre bloqué).",
    };
  }
}