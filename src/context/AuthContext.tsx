import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string | undefined;
  username: string;
  avatarUrl?: string;
  role: UserRole;
  joinedAt: string;
  rank?: number | string;
  points?: number;
  country?: string;
  gender?: string;
  relationship?: string;
  orientation?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Pick<AuthUser, "username" | "avatarUrl">>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fetchProfile = async (userId: string): Promise<{ role: UserRole; username: string | null; avatar_url: string | null } | null> => {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role, username, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
};

const buildAuthUser = (
  user: User,
  profile: { role: UserRole; username: string | null; avatar_url: string | null } | null,
): AuthUser => ({
  id: user.id,
  email: user.email,
  username:
    profile?.username ??
    user.user_metadata?.username ??
    user.email?.split("@")[0] ??
    "user",
  avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? undefined,
  role: (profile?.role as UserRole) ?? "user",
  joinedAt: user.created_at,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user from session + profile
  const hydrate = useCallback(async (sess: Session | null) => {
    if (!sess?.user) {
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }
    setSession(sess);
    const profile = await fetchProfile(sess.user.id);
    setUser(buildAuthUser(sess.user, profile));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => hydrate(data.session));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      hydrate(sess);
    });

    return () => subscription.unsubscribe();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signup = useCallback(async (email: string, password: string, username?: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username ?? email.split("@")[0] } },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<Pick<AuthUser, "username" | "avatarUrl">>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      role: user?.role ?? null,
      isAdmin: user?.role === "admin",
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, session, isLoading, login, signup, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};