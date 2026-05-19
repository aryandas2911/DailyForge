import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {

  // access token from AuthContext
  const { token } = useContext(AuthContext);
  const location = useLocation();

  // if token doesn't exist, return to login page
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // else return the children component
  else {
    return children;
  }
};

export default ProtectedRoutes;
