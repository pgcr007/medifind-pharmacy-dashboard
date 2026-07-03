import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("medifind_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [pharmacy, setPharmacy] = useState(null);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [pharmacyError, setPharmacyError] = useState(null);

  const loadPharmacy = useCallback(async () => {
    setPharmacyLoading(true);
    setPharmacyError(null);
    try {
      const p = await api.getMyPharmacy();
      setPharmacy(p);
    } catch (err) {
      setPharmacyError(
        err.response?.status === 404
          ? "No pharmacy is registered to this account yet."
          : "Couldn't load your pharmacy. Try refreshing."
      );
    } finally {
      setPharmacyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadPharmacy();
  }, [user, loadPharmacy]);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await api.login(email, password);
    localStorage.setItem("medifind_token", token);
    localStorage.setItem("medifind_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("medifind_token");
    localStorage.removeItem("medifind_user");
    setUser(null);
    setPharmacy(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        pharmacy,
        pharmacyLoading,
        pharmacyError,
        setPharmacy,
        reloadPharmacy: loadPharmacy,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
