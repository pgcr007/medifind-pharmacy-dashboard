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
  const [pharmacyNotFound, setPharmacyNotFound] = useState(false);

  const loadPharmacy = useCallback(async () => {
    setPharmacyLoading(true);
    setPharmacyError(null);
    setPharmacyNotFound(false);
    try {
      const p = await api.getMyPharmacy();
      setPharmacy(p);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setPharmacyNotFound(true);
        setPharmacyError("No pharmacy is registered to this account yet.");
      } else if (status === 403) {
        setPharmacyError("This account isn't authorized to access pharmacy data.");
      } else {
        setPharmacyError("Couldn't load your pharmacy. Try refreshing.");
      }
    } finally {
      setPharmacyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadPharmacy();
  }, [user, loadPharmacy]);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await api.login(email, password);
    if (loggedInUser.role !== "pharmacy") {
      const err = new Error("This dashboard is for pharmacy accounts only.");
      err.isWrongRole = true;
      throw err;
    }
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
        pharmacyNotFound,
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