import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

// create context component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Safely grab the token and prevent the "String Trap"
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken === "null" || savedToken === "undefined") {
      localStorage.removeItem("token");
      return null;
    }
    return savedToken;
  });

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
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;