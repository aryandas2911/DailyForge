import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoutes = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  // 1. If there is a token but no user object yet, the app is still talking to the backend.
  // We show a loading screen instead of letting the user step forward or backward.
  if (token && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b8ea0]"></div>
      </div>
    );
  }

  // 2. If there is absolutely no token and no user, they are logged out. Bounce them!
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Otherwise, they are authenticated. Show the page.
  return children;
};

export default ProtectedRoutes;