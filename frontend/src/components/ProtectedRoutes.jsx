import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";
import TaskProvider from "../context/TaskContext.jsx";

const ProtectedRoutes = () => {
  // access token from AuthContext
  const { token } = useContext(AuthContext);

  // if token doesn't exist, return to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TaskProvider>
      <Outlet />
    </TaskProvider>
  );
};

export default ProtectedRoutes;
