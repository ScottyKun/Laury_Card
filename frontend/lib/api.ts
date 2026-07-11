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