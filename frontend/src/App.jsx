import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
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
import Profile from './pages/Profile.jsx';
import ScrollToTop from "./components/ScrollToTop.jsx";
import PageTransition from "./components/ui/PageTransition.jsx";

const AuthLayout = ({ children }) => (
  <div className="min-h-[calc(100vh-3.75rem)] flex items-center justify-center px-4">
    {children}
  </div>
);

const App = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main className="app-bg min-h-screen pt-15 flex flex-col overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"       element={<PublicRoute><AuthLayout><PageTransition><Login /></PageTransition></AuthLayout></PublicRoute>} />
            <Route path="/login"  element={<PublicRoute><AuthLayout><PageTransition><Login /></PageTransition></AuthLayout></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><AuthLayout><PageTransition><Signup /></PageTransition></AuthLayout></PublicRoute>} />
            <Route path="/about"  element={<AuthLayout><PageTransition><About /></PageTransition></AuthLayout>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoutes>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoutes>
                  <PageTransition>
                    <Tasks />
                  </PageTransition>
                </ProtectedRoutes>
              }
            />
            <Route
              path="/routine-builder"
              element={
                <ProtectedRoutes>
                  <PageTransition>
                    <RoutineBuilder />
                  </PageTransition>
                </ProtectedRoutes>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoutes>
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                </ProtectedRoutes>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoutes>
                  <PageTransition>
                    <Analytics />
                  </PageTransition>
                </ProtectedRoutes>
              }
            />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default App;