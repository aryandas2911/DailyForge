import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {

  // access user and isLoading from AuthContext
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // if user doesn't exist, return to login page
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // else return the children component
  else {
    return children;
  }
};

export default ProtectedRoutes;
