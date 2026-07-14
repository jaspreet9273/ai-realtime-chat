"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { authApi } from "@/services/api/auth";
import { AppUser } from "@/types";

interface AppUserContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  setPremium: (isPremium: boolean) => void;
}

const AppUserContext = createContext<AppUserContextValue | undefined>(
  undefined,
);

export function AppUserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveUser() {
      if (status === "loading") return;

      if (status !== "authenticated" || !session?.idToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const verifiedUser = await authApi.verify(session.idToken);
        if (!cancelled) {
          setUser(verifiedUser);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to verify session",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolveUser();
    return () => {
      cancelled = true;
    };
  }, [status, session?.idToken]);

  const setPremium = useCallback((isPremium: boolean) => {
    setUser((prev) => (prev ? { ...prev, isPremium } : prev));
  }, []);

  return (
    <AppUserContext.Provider value={{ user, loading, error, setPremium }}>
      {children}
    </AppUserContext.Provider>
  );
}

export function useAppUser() {
  const ctx = useContext(AppUserContext);
  if (!ctx) {
    throw new Error("useAppUser must be used within an AppUserProvider");
  }
  return ctx;
}
