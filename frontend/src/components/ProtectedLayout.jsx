import { Outlet } from "react-router-dom";

import ProtectedRoutes from "./ProtectedRoutes.jsx";
import { TasksProvider } from "../context/TasksContext.jsx";

export default function ProtectedLayout() {
  return (
    <ProtectedRoutes>
      <TasksProvider>
        <Outlet />
      </TasksProvider>
    </ProtectedRoutes>
  );
}
