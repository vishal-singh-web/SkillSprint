import { clearAuth, getToken, saveAuth } from "./auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "API request failed");
  }

  return data;
}

export async function signup(payload) {
  const data = await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAuth({
    accessToken: data.accessToken,
    profile: {
      name: payload.name,
      email: payload.email,
      targetRole: payload.targetRole,
      skills: payload.skills,
    },
    user: data.user,
  });

  return data;
}

export async function login(payload) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAuth({
    accessToken: data.accessToken,
    user: data.user,
  });

  return data;
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    clearAuth();
  }
}
