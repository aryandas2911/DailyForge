import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import RoutineBuilder from "./pages/RoutineBuilder.jsx";
import Analytics from "./pages/Analytics.jsx";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

const AuthLayout = ({ children }) => (
  <div className="min-h-[calc(100vh-3.75rem)] flex items-center justify-center px-4">
    {children}
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-bg min-h-screen flex flex-col">
        
        <Navbar />

        <main className="pt-15 flex-grow flex flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </PublicRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Signup />
                  </AuthLayout>
                </PublicRoute>
              }
            />

            <Route
              path="/about"
              element={
                <AuthLayout>
                  <About />
                </AuthLayout>
              }
            />

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

            <Route
              path="/profile"
              element={
                <ProtectedRoutes>
                  <Profile />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoutes>
                  <Analytics />
                </ProtectedRoutes>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </BrowserRouter>
  );
};

export default App;