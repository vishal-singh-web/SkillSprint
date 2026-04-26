export const TOKEN_KEY = "skillsprint_token";
export const PROFILE_KEY = "skillsprint_profile";
export const TOKEN_EXPIRES_KEY = "skillsprint_token_expires_at";

const isBrowser = () => typeof window !== "undefined";

export function saveAuth({ accessToken, profile, user }) {
  if (!isBrowser()) return;

  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  }

  if (profile || user) {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        ...(profile || {}),
        email: profile?.email || user?.email,
      })
    );
  }
}

export function saveTokenExpiry(expiresAt) {
  if (!isBrowser() || !expiresAt) return;
  localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
}

export function getToken() {
  if (!isBrowser()) return null;

  const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_KEY));
  if (expiresAt && Date.now() >= expiresAt * 1000) {
    clearAuth();
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredProfile() {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function clearAuth() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_KEY);
}
