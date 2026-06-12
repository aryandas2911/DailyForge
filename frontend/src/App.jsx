import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import Tasks from "./pages/Tasks.jsx";
import RoutineBuilder from "./pages/RoutineBuilder.jsx";
import Analytics from "./pages/Analytics.jsx";
import Footer from "./components/Footer.jsx";
import NotFound from "./pages/NotFound.jsx";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PageTransition from "./components/PageTransition.jsx";
import ShareRoutine from "./pages/ShareRoutine.jsx";

const AuthLayout = ({ children }) => (
  <div className="min-h-[calc(100vh-3.75rem)] w-full flex items-center justify-center">
    {children}
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicRoute>
              <PageTransition>
                <LandingPage />
              </PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <PageTransition>
                  <Login />
                </PageTransition>
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthLayout>
                <PageTransition>
                  <Signup />
                </PageTransition>
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
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <Tasks />
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/routine-builder"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <RoutineBuilder />
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/focus-mode"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <Pomodoro />
              </ErrorBoundary>
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
        <Route path="/share/routine/:id" element={<ShareRoutine />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="bg-slate-50 dark:bg-slate-950 min-h-screen pt-15 flex flex-col text-slate-900 dark:text-white transition-colors duration-300 w-full box-border">
        <AnimatedRoutes />
      </main>
      <Footer />
      <ScrollToTop />
    </BrowserRouter>
  );
};

export default App;