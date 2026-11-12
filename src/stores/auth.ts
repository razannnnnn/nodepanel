import { create } from "zustand";
import { api, getToken, setToken } from "@/lib/api";

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: null,

  login: async (username, password) => {
    const res = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(res.token);
    set({ token: res.token, user: res.user });
  },

  logout: async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // token already invalid server-side
    }
    setToken(null);
    set({ token: null, user: null });
  },

  restore: async () => {
    if (!getToken()) {
      set({ token: null, user: null });
      return;
    }
    try {
      const res = await api<{ user: AuthUser }>("/api/auth/me");
      set({ token: getToken(), user: res.user });
    } catch {
      setToken(null);
      set({ token: null, user: null });
    }
  },
}));
