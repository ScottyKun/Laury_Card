const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function registerUser(data: {
  firstName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de l'inscription");
  return body;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la connexion");
  return body;
}

export async function saveCard(data: {
  title: string;
  canvasJson: object;
  thumbnail: string;
  format: string;
  widthPx: number;
  heightPx: number;
  cardId?: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/cards${data.cardId ? `/${data.cardId}` : ""}`, {
    method: data.cardId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la sauvegarde");
  return body;
}

export type CardSummary = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  format: string;
  width_px: number;
  height_px: number;
  updated_at: string;
};

export async function getCards(): Promise<CardSummary[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/cards`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du chargement des cartes");
  return body.cards;
}

export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du chargement du profil");
  return body.user;
}

export async function deleteCardApi(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/cards/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || "Erreur lors de la suppression");
  }
}

export async function getCardById(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/cards/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du chargement de la carte");
  return { card: body.card, isOwner: body.isOwner as boolean };
}

export type Asset = { id: string; url: string; created_at: string };

export async function uploadAsset(file: File): Promise<Asset> {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de l'upload");
  return body.asset;
}

export async function getAssets(): Promise<Asset[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/assets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du chargement");
  return body.assets;
}

export async function duplicateCardApi(id: string): Promise<CardSummary> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/cards/${id}/duplicate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la duplication");
  return body.card;
}

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
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la création du livre");
  return body.book;
}

export async function getBooks(): Promise<Book[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du chargement des livres");
  return body.books;
}

export async function getBookById(id: string): Promise<{ book: Book; pages: BookPage[] }> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du chargement du livre");
  return body;
}

export async function updateBookApi(
  id: string,
  data: { title?: string; pages?: { cardId: string; transitionType: string }[] }
): Promise<{ book: Book; pages: BookPage[] }> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la sauvegarde du livre");
  return body;
}

export async function deleteBookApi(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || "Erreur lors de la suppression");
  }
}

export async function updateProfile(data: { firstName: string; email: string }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la mise à jour");
  return body.user;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/me/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du changement de mot de passe");
  return body;
}

export type ShareItem = {
  id: string;
  status: "unread" | "read";
  created_at: string;
  card_id: string | null;
  book_id: string | null;
  sender_first_name: string;
  card_title: string | null;
  card_thumbnail_url: string | null;
  card_width_px: number | null;
  card_height_px: number | null;
  book_title: string | null;
  book_thumbnail_url: string | null;
};

export async function shareItem(data: { recipientEmail: string; cardId?: string; bookId?: string }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/shares`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors du partage");
  return body.share;
}

export async function getInbox(): Promise<ShareItem[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/shares/inbox`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur");
  return body.shares;
}

export async function getUnreadCount(): Promise<number> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/shares/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur");
  return body.count;
}

export async function markShareReadApi(id: string) {
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/shares/${id}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function forkCardApi(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/cards/${id}/fork`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la copie");
  return body.card;
}

export async function duplicateBookApi(id: string): Promise<Book> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books/${id}/duplicate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Erreur lors de la duplication");
  return body.book;
}

export async function exportBookPdf(id: string, title: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/books/${id}/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json();
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