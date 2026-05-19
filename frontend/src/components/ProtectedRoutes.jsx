import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {

  // access user and isLoading from AuthContext
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // if user doesn't exist, return to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // else return the children component
  else {
    return children;
  }
};

export default ProtectedRoutes;
