import { createContext, useCallback, useEffect, useState } from "react";
import api from "../api/axios";

// create context component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isAuthLoading, setIsAuthLoading] = useState(
    () => !!localStorage.getItem("token"),
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  // restore session on app load (wait before treating user as logged out)
  useEffect(() => {
    if (!token) {
      setIsAuthLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsAuthLoading(true);

    api
      .get("/auth/me")
      .then((res) => {
        if (!cancelled) {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        // Only clear session when the token is rejected, not on cold-start/network errors
        if (err.response?.status === 401) {
          logout();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, isAuthLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
