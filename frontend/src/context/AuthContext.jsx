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
    localStorage.removeItem("token");
    localStorage.removeItem("activeRoutineTasks"); // specifically requested in issue #882
    localStorage.clear(); // Ensure all stale data is wiped
  };

  // restore session on app load
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        // token invalid or expired
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
