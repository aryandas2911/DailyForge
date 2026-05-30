import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PageTransition from "./components/PageTransition.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Tasks = lazy(() => import("./pages/Tasks.jsx"));
const RoutineBuilder = lazy(() => import("./pages/RoutineBuilder.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const AuthLayout = ({ children }) => (
  <div className="min-h-[calc(100vh-3.75rem)] flex items-center justify-center px-4">
    {children}
  </div>
);

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-t-[#4eb7b3] border-r-transparent border-b-[#4eb7b3] border-l-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-r-[#98e1d7] border-t-transparent border-l-[#98e1d7] border-b-transparent animate-spin [animation-direction:reverse]"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading Forge...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"       element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
        <Route path="/login"  element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthLayout><Signup /></AuthLayout></PublicRoute>} />
        <Route path="/about"  element={<AuthLayout><About /></AuthLayout>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <PageTransition><Dashboard /></PageTransition>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <PageTransition><Tasks /></PageTransition>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/routine-builder"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <PageTransition><RoutineBuilder /></PageTransition>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoutes>
              <PageTransition><Profile /></PageTransition>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoutes>
              <PageTransition><Analytics /></PageTransition>
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-bg min-h-screen pt-15 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </BrowserRouter>
  );
};

export default App;
