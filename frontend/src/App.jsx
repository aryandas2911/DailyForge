import React from "react";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import Tasks from "./pages/Tasks.jsx";
import RoutineBuilder from "./pages/RoutineBuilder.jsx";
import NotFound from "./pages/NotFound.jsx";
import About from "./pages/About.jsx";
import AppLayout from "./pages/AppLayout.jsx";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
      <Routes>

        {/* Layout Wrapper */}
        <Route element={<AppLayout />}>

          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoutes>
                <Tasks />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/routine-builder"
            element={
              <ProtectedRoutes>
                <RoutineBuilder />
              </ProtectedRoutes>
            }
          />
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
  );
};

export default App;
