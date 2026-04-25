// CareerFlow 2026 — auth helpers (localStorage based, client-only)

export const CF_STORAGE_KEY = "careerflow_users";
export const CF_SESSION_KEY = "careerflow_session";

export const DEMO_USER = {
  name: "Priya Krishnan",
  email: "demo@careerflow.com",
  github: "priyak",
  password: "careerflow2026",
};

const isBrowser = () => typeof window !== "undefined";

export function cfLoadUsers() {
  if (!isBrowser()) return [DEMO_USER];
  try {
    const raw = localStorage.getItem(CF_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!list.find((u) => u.email === DEMO_USER.email)) list.push(DEMO_USER);
    return list;
  } catch {
    return [DEMO_USER];
  }
}

export function cfSaveUsers(users) {
  if (!isBrowser()) return;
  localStorage.setItem(CF_STORAGE_KEY, JSON.stringify(users));
}

export function cfRegister({ name, email, github, password }) {
  const users = cfLoadUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return {
      ok: false,
      error: "An account with that email already exists. Try logging in.",
    };
  }
  const user = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    github: github.trim(),
    password,
  };
  users.push(user);
  cfSaveUsers(users);
  cfStartSession(user);
  return { ok: true, user };
}

export function cfLogin(email, password) {
  const users = cfLoadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: "No account with that email. Try signing up?" };
  if (user.password !== password) return { ok: false, error: "Wrong password. Try again." };
  cfStartSession(user);
  return { ok: true, user };
}

export function cfStartSession(user) {
  if (!isBrowser()) return;
  const session = {
    name: user.name,
    email: user.email,
    github: user.github,
    loginAt: Date.now(),
  };
  localStorage.setItem(CF_SESSION_KEY, JSON.stringify(session));
}

export function cfGetSession() {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(CF_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function cfLogout() {
  if (!isBrowser()) return;
  localStorage.removeItem(CF_SESSION_KEY);
}
