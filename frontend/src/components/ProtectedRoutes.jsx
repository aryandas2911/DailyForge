import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // wait until auth state is checked
  if (loading) {
    return null;
  }

  // redirect unauthenticated users
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;