const TOKEN_KEY = "token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; 

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "token=; path=/; max-age=0";
}