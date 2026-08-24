import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi } from "../services/data";

const AuthContext = createContext(null);

const TOKEN_KEY = "bh_token";
const USER_KEY = "bh_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user && localStorage.getItem(TOKEN_KEY)),
    async login(email, password) {
      setLoading(true);
      try {
        const res = await loginApi(email, password);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data.user);
        return { ok: true };
      } catch (err) {
        const msg = err.response?.data?.error?.message || "Login failed.";
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}