import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

// create context component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // logout function
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.log(e);
    }
    setUser(null);
  };

  // restore session on app load
  useEffect(() => {
    if (token) {
      // fetch logged-in user with Authorization header
      (async () => {
        try {
          const tokenLocal = localStorage.getItem("token");
          const res = await api.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${tokenLocal}`,
            },
          });
          setUser(res.data.user);
        } catch (err) {
          // token invalid or expired
          logout();
        }
      })();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
