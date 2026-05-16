import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

// create context component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isInitialized, setIsInitialized] = useState(false);

  // logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // restore session on app load
  useEffect(() => {
    if (token) {
      // fetch logged-in user
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          // token invalid or expired
          logout();
        })
        .finally(() => {
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isInitialized, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
