// Tiny client for the Laravel Sanctum API. All calls run in the browser and
// attach a Bearer token when one is stored. The base URL is inlined at build
// time, so it MUST use the NEXT_PUBLIC_ prefix and a literal static lookup.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "monitor_token";

export type User = {
  id: number;
  name: string;
  email: string;
};

// Thrown for any non-2xx response so callers can branch on status/validation.
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// localStorage is only available in the browser. Client Components are
// prerendered on the server, so guard every access against `window`.
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");

  if (withAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.message ?? `Request failed with status ${res.status}`,
      res.status,
      data?.errors,
    );
  }

  return data as T;
}

export function apiLogin(email: string, password: string) {
  return request<{ user: User; token: string }>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiGetUser() {
  return request<User>("/api/user", { method: "GET" }, true);
}

export function apiLogout() {
  return request<{ message: string }>("/api/logout", { method: "POST" }, true);
}
