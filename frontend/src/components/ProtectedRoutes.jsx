import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {

  // access token and isInitialized from AuthContext
  const { token, isInitialized } = useContext(AuthContext);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen app-bg w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // if token doesn't exist, return to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // else return the children component
  else {
    return children;
  }
};

export default ProtectedRoutes;
