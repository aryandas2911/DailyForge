import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

// create context component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [initializing, setInitializing] = useState(
    () => !!localStorage.getItem("token")
  );

  // logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    setInitializing(false);
  };

  // restore session on app load
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }

    let cancelled = false;
    setInitializing(true);

    api
      .get("/auth/me")
      .then((res) => {
        if (!cancelled) setUser(res.data.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, initializing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
