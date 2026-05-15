import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
    } finally {
      setLoading(false);
    }
  };

  // signup function
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
    } finally {
      setLoading(false);
    }
  };

  // restore session on app load
  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout, login, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;