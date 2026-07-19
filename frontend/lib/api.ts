const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
let isRedirectingToLogin = false;

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Réponse inattendue du serveur (${res.status}). Vérifie que la route existe.`);
  }
}

async function authorizedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";

    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;
      window.location.href = "/login?expired=1";
    }

    throw new Error("Session expirée");
  }

  return res;
}

async function authorizedJsonFetch(url: string, options: RequestInit = {}) {
  const res = await authorizedFetch(url, options);
  const body = await parseJsonResponse(res);
  if (!res.ok) throw new Error(body.error || "Une erreur est survenue");
  return body;
}

// --- Auth (non authentifié : register/login n'ont pas encore de token) ---

export async function registerUser(data: { firstName: string; email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await parseJsonResponse(res);
  if (!res.ok) throw new Error(body.error || "Erreur lors de l'inscription");
  return body;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await parseJsonResponse(res);
  if (!res.ok) throw new Error(body.error || "Erreur lors de la connexion");
  return body; // { mfaRequired: true, userId }
}

export async function verifyMfaApi(data: { userId: string; code: string }) {
  const res = await fetch(`${API_URL}/auth/verify-mfa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await parseJsonResponse(res);
  if (!res.ok) throw new Error(body.error || "Code invalide");
  return body; // { user, token }
}

export async function getCurrentUser() {
  const body = await authorizedJsonFetch(`${API_URL}/auth/me`);
  return body.user;
}

export async function updateProfile(data: { firstName: string; email: string }) {
  const body = await authorizedJsonFetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return body.user;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  return authorizedJsonFetch(`${API_URL}/auth/me/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// --- Cards ---

export type CardSummary = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  format: string;
  width_px: number;
  height_px: number;
  updated_at: string;
};

export async function saveCard(data: {
  title: string;
  canvasJson: object;
  thumbnail: string;
  format: string;
  widthPx: number;
  heightPx: number;
  cardId?: string;
}) {
  return authorizedJsonFetch(`${API_URL}/cards${data.cardId ? `/${data.cardId}` : ""}`, {
    method: data.cardId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getCards(): Promise<CardSummary[]> {
  const body = await authorizedJsonFetch(`${API_URL}/cards`);
  return body.cards;
}

export async function getCardById(id: string) {
  const body = await authorizedJsonFetch(`${API_URL}/cards/${id}`);
  return { card: body.card, isOwner: body.isOwner as boolean };
}

export async function deleteCardApi(id: string) {
  await authorizedJsonFetch(`${API_URL}/cards/${id}`, { method: "DELETE" });
}

export async function duplicateCardApi(id: string): Promise<CardSummary> {
  const body = await authorizedJsonFetch(`${API_URL}/cards/${id}/duplicate`, { method: "POST" });
  return body.card;
}

export async function forkCardApi(id: string) {
  const body = await authorizedJsonFetch(`${API_URL}/cards/${id}/fork`, { method: "POST" });
  return body.card;
}

// --- Assets ---

export type Asset = { id: string; url: string; created_at: string };

export async function uploadAsset(file: File): Promise<Asset> {
  const formData = new FormData();
  formData.append("image", file);
  const body = await authorizedJsonFetch(`${API_URL}/assets`, {
    method: "POST",
    body: formData, // pas de Content-Type manuel : le navigateur fixe le boundary multipart lui-même
  });
  return body.asset;
}

export async function getAssets(): Promise<Asset[]> {
  const body = await authorizedJsonFetch(`${API_URL}/assets`);
  return body.assets;
}

// --- Books ---

export type BookPage = {
  id: string;
  position: number;
  transition_type: "fade" | "slide" | "flip" | "none";
  card_id: string;
  card_title: string;
  thumbnail_url: string | null;
  width_px: number;
  height_px: number;
};

export type Book = {
  id: string;
  title: string;
  cover_thumbnail_url: string | null;
  cover_width_px: number | null;
  cover_height_px: number | null;
  updated_at: string;
};

export async function createBookApi(title?: string): Promise<Book> {
  const body = await authorizedJsonFetch(`${API_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return body.book;
}

export async function getBooks(): Promise<Book[]> {
  const body = await authorizedJsonFetch(`${API_URL}/books`);
  return body.books;
}

export async function getBookById(id: string): Promise<{ book: Book; pages: BookPage[]; isOwner: boolean }> {
  return authorizedJsonFetch(`${API_URL}/books/${id}`);
}

export async function updateBookApi(
  id: string,
  data: { title?: string; pages?: { cardId: string; transitionType: string }[] }
): Promise<{ book: Book; pages: BookPage[] }> {
  return authorizedJsonFetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteBookApi(id: string) {
  await authorizedJsonFetch(`${API_URL}/books/${id}`, { method: "DELETE" });
}

export async function duplicateBookApi(id: string): Promise<Book> {
  const body = await authorizedJsonFetch(`${API_URL}/books/${id}/duplicate`, { method: "POST" });
  return body.book;
}

export async function exportBookPdf(id: string, title: string) {
  const res = await authorizedFetch(`${API_URL}/books/${id}/export`);
  if (!res.ok) {
    const body = await parseJsonResponse(res);
    throw new Error(body.error || "Erreur lors de l'export");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

// --- Shares ---

export async function shareItem(data: { recipientEmail: string; cardId?: string; bookId?: string }) {
  const body = await authorizedJsonFetch(`${API_URL}/shares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return body.share;
}

// --- Notifications (partages + jalons + relances, flux unifié) ---

export type NotificationItem = {
  id: string;
  type: "share_card" | "share_book" | "milestone" | "nudge";
  message: string;
  card_id: string | null;
  book_id: string | null;
  read: boolean;
  created_at: string;
};

export async function getNotifications(): Promise<NotificationItem[]> {
  const body = await authorizedJsonFetch(`${API_URL}/notifications`);
  return body.notifications;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const body = await authorizedJsonFetch(`${API_URL}/notifications/unread-count`);
  return body.count;
}

export async function markNotificationReadApi(id: string) {
  await authorizedFetch(`${API_URL}/notifications/${id}/read`, { method: "PUT" });
}

// --- Milestones ---

export type Milestone = {
  id: string;
  label: string;
  start_date: string;
  minor_frequency: "monthly" | "bimonthly";
  minor_day: number;
};

export async function createMilestoneApi(data: {
  label: string;
  startDate: string;
  minorFrequency: string;
  minorDay: number;
}): Promise<Milestone> {
  const body = await authorizedJsonFetch(`${API_URL}/milestones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return body.milestone;
}

export async function getMilestones(): Promise<Milestone[]> {
  const body = await authorizedJsonFetch(`${API_URL}/milestones`);
  return body.milestones;
}

export async function deleteMilestoneApi(id: string) {
  await authorizedFetch(`${API_URL}/milestones/${id}`, { method: "DELETE" });
}