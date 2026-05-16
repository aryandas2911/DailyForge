import useAuthStore from "../store/authStore.js";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {

  // access token from authStore
  const token = useAuthStore((state) => state.token);
  console.log("ProtectedRoutes - token:", token);
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
