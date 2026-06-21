"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  apiGetUser,
  apiLogin,
  apiLogout,
  clearToken,
  getToken,
  setToken,
  type User,
} from "@/lib/api";

type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // On first mount (browser only), revalidate any stored token against the API.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    apiGetUser()
      .then((u) => {
        setUser(u);
        setStatus("authenticated");
      })
      .catch(() => {
        // Token missing/expired/revoked — drop it and treat as logged out.
        clearToken();
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await apiLogin(email, password);
    setToken(token);
    setUser(u);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    // Best-effort server-side revocation; clear locally regardless.
    try {
      await apiLogout();
    } catch {
      // ignore network/401 — the token is being discarded anyway
    }
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext value={{ user, status, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
