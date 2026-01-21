const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
};

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    `path=${COOKIE_OPTIONS.path}`,
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
  ];

  if (COOKIE_OPTIONS.secure) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getAccessToken(): string | null {
  return getCookie(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  setCookie(TOKEN_KEY, accessToken, 1);
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 7);
}

export function setAccessToken(accessToken: string): void {
  setCookie(TOKEN_KEY, accessToken, 1);
}

export function setRefreshToken(refreshToken: string): void {
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 7);
}

export function clearTokens(): void {
  deleteCookie(TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

export function hasValidToken(): boolean {
  return !!getAccessToken();
}
