import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // access user and loading state from AuthContext
const { user, isLoading } = useContext(AuthContext);
const location = useLocation();

// wait until auth state is checked
if (isLoading) {
  return null;
}

// redirect unauthenticated users
if (!user) {
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

  return children;
};

export default ProtectedRoutes;