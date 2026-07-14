import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { getStored, setStored, clearStored } from "../lib/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = getStored("admin-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStored("admin-token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        clearStored("admin-token");
        clearStored("admin-user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // `remember` controls whether the session survives a browser restart
  // (localStorage) or ends when the tab closes (sessionStorage) — the
  // login page's "Remember me" checkbox.
  const login = async (email, password, remember = true) => {
    const { data } = await api.post("/auth/login", { email, password });
    setStored("admin-token", data.data.token, remember);
    setStored("admin-user", JSON.stringify(data.data), remember);
    setUser(data);
    return data;
  };

  const logout = () => {
    clearStored("admin-token");
    clearStored("admin-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
