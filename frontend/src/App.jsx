import React, { useState, useRef, useCallback, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import KeyboardShortcutsProvider from "./components/KeyboardShortcutsProvider.jsx";
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
import DailyJournal from "./pages/DailyJournal.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import CustomToast from "./components/CustomToast.jsx"; // Import the new CustomToast

const AuthLayout = ({ children }) => (
  <div className="min-h-[calc(100vh-3.75rem)] flex items-center justify-center">
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
            <LandingPage />
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
              <ErrorBoundary>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <PageTransition>
                  <Tasks />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/routine-builder"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <PageTransition>
                  <RoutineBuilder />
                </PageTransition>
              </ErrorBoundary>
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
        <Route
          path="/daily-journal"
          element={
            <ProtectedRoutes>
              <ErrorBoundary>
                <PageTransition><DailyJournal /></PageTransition>
              </ErrorBoundary>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/forge"
          element={
            <ProtectedRoutes>
              <PageTransition><ForgeMode /></PageTransition>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/focus"
          element={
            <ProtectedRoutes>
              <PageTransition><ForgeMode /></PageTransition>
            </ProtectedRoutes>
          }
        />
        <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <AuthLayout>
                  <ResetPasswordPage />
                </AuthLayout>
              </PublicRoute>
            }
          />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </AnimatePresence>
  );
};

const App = () => {

  // Centralized Toast Notification Sytem for Complete Application
  const [toast, setToast] = useState({ message: "", type: "success" });
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  return (
    <KeyboardShortcutsProvider>
    <BrowserRouter>
      <Navbar />
      {/* Pass showToast to components that need it */}
      <main className="app-bg min-h-screen pt-24 sm:pt-28 flex flex-col text-main transition-colors duration-300">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage showToast={showToast} />
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Login showToast={showToast} />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Signup showToast={showToast} />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <AuthLayout>
                <About showToast={showToast} />
              </AuthLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
              <Dashboard showToast={showToast} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoutes>
                <Tasks showToast={showToast} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/routine-builder"
            element={
              <ProtectedRoutes>
                <RoutineBuilder showToast={showToast} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/focus-mode"
            element={
              <ProtectedRoutes>
                <Pomodoro showToast={showToast} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <Profile showToast={showToast} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoutes>
                <Analytics showToast={showToast} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/daily-journal"
            element={
              <ProtectedRoutes>
                <DailyJournal showToast={showToast}  />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <AuthLayout>
                  <ResetPasswordPage showToast={showToast}/>
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route path="/share/routine/:id" element={<ShareRoutine />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CustomToast message={toast.message} type={toast.type} />
      <ScrollToTop />
    </BrowserRouter>
    </KeyboardShortcutsProvider>
  );
};

export default App;
