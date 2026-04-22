"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User } from "@/lib/types";
import { getMe } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("finvisor_token");
      }
    }
  }, []);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("finvisor_token")
        : null;
    if (storedToken) {
      setToken(storedToken);
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem("finvisor_token", newToken);
      setToken(newToken);
      await fetchUser();
    },
    [fetchUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("finvisor_token");
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "Admin";
  const isCustomer = user?.role === "Customer";

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAdmin, isCustomer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
