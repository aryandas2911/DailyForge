import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

// create context component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  // loading is true while we verify a stored token on app load
  const [loading, setLoading] = useState(() => !!localStorage.getItem("token"));

  // logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // restore session once on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // fetch logged-in user to validate the stored token
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          setToken(storedToken);
        })
        .catch(() => {
          // token invalid or expired — clear session
          logout();
        })
        .finally(() => {
          // session check complete, allow routing to proceed
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
