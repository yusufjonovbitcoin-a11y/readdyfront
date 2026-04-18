import { useState, useEffect, useCallback } from "react";

export type UserRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  hospitalName?: string;
  avatar: string;
  token: string;
}

const AUTH_KEY = "medcore_auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        // Check token expiry (mock: 24h)
        setUser(parsed);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}

export function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}
