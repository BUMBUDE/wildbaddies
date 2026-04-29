import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser {
  username: string;
  email?: string;
  avatarUrl?: string;
  joinedAt: string; // ISO date
  country?: string;
  gender?: string;
  relationship?: string;
  orientation?: string;
  rank?: number;
  points?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  signup: (username: string, email?: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const STORAGE_KEY = "wb_auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

const readStored = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStored());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback((username: string) => {
    const clean = (username || "user").trim() || "user";
    setUser((prev) =>
      prev ?? {
        username: clean,
        joinedAt: new Date().toISOString(),
        rank: Math.floor(10000 + Math.random() * 9999),
        points: 0,
        country: "—",
      },
    );
  }, []);

  const signup = useCallback((username: string, email?: string) => {
    const clean = (username || "user").trim() || "user";
    setUser({
      username: clean,
      email,
      joinedAt: new Date().toISOString(),
      rank: Math.floor(10000 + Math.random() * 9999),
      points: 0,
      country: "—",
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, login, signup, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};