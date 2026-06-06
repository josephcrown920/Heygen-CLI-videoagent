import { useState, useEffect, useCallback } from "react";
import { apiLoginPath, apiPath, getAppBasePath } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(apiPath("/api/auth/user"), { credentials: "include" })
      .then((res) => res.json() as Promise<{ user: AuthUser | null }>)
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(() => {
    window.location.href = apiLoginPath(getAppBasePath());
  }, []);

  const logout = useCallback(() => {
    window.location.href = apiPath("/api/logout");
  }, []);

  return { user, isLoading, isAuthenticated: !!user, login, logout };
}
