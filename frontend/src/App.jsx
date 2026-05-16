import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import Tasks from "./pages/Tasks.jsx";
import RoutineBuilder from "./pages/RoutineBuilder.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar />
        <main className="app-bg min-h-screen pt-15 flex justify-center items-center">
          <Routes>
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
          </Routes>
        </main>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
