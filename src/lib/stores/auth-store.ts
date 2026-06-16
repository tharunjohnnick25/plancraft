import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, setTokens, clearTokens } from "../api-client";

function setAuthCookie(value: string) {
  if (typeof document !== "undefined") {
    document.cookie = `plancraft_auth=${value}; path=/; max-age=${value === "true" ? 604800 : 0}; SameSite=Lax`;
  }
}

export interface User {
  id: string; name: string; email: string;
  role: "user" | "admin" | "architect" | "builder" | "designer";
  plan: "free" | "pro" | "enterprise"; createdAt: string; verified: boolean;
  company?: string; country?: string; phone?: string; bio?: string;
  aiCreditsUsed: number; aiCreditsTotal: number; storageUsedMb: number;
  storageQuotaMb: number; projectsCount: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await apiClient("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return false;
          }
          setTokens(data.access_token, data.refresh_token);
          setAuthCookie("true");
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await apiClient("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return false;
          }
          setTokens(data.access_token, data.refresh_token);
          setAuthCookie("true");
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },
      logout: async () => {
        try {
          await apiClient("/api/auth/logout", { method: "POST" });
        } catch {}
        clearTokens();
        setAuthCookie("false");
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: async (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },
      resetPassword: async (email: string) => {
        try {
          const res = await apiClient("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword: "Temp123" }),
          });
          return res.ok;
        } catch {
          return false;
        }
      },
      checkAuth: async () => {
        if (get().isAuthenticated) return;
        try {
          const res = await apiClient("/api/auth/me");
          const data = await res.json();
          if (res.ok && data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: "auth-storage" }
  )
);
