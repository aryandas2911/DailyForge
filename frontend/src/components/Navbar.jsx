import { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  LogOut,
  LogIn,
  User,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import gsap from "gsap";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ThemeToggle from "./ThemeToggle";

// Utility for merging tailwind classes safely
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

//logout modal
const LogoutModal = ({ isOpen, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border)]/30 dark:border-slate-700 p-8 w-full max-w-sm text-center shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-5">
            <LogOut size={26} className="text-orange-500" />
          </div>

          {/* Text */}
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Log out of DailyForge?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-7">
            You'll need to log back in to access your dashboard, tasks, and
            routines.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border)]/50 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={(e) => onConfirm(e)}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              Log out
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle scroll effect for premium glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu automatically on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };
  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleConfirmLogout = (e) => {
    setShowLogoutModal(false);
    setIsOpen(false);

    if (!e || !e.clientX) {
      logout();
      return;
    }

    const { clientX, clientY } = e;

    const overlay = document.createElement("div");
    overlay.id = "logout-transition-overlay";
    overlay.style.position = "fixed";
    overlay.style.backgroundColor = "#f97316";
    overlay.style.borderRadius = "50%";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";

    const size = 10;
    overlay.style.width = `${size}px`;
    overlay.style.height = `${size}px`;
    overlay.style.top = `${clientY - size / 2}px`;
    overlay.style.left = `${clientX - size / 2}px`;
    overlay.style.transformOrigin = "center center";

    document.body.appendChild(overlay);

    const maxDistX = Math.max(clientX, window.innerWidth - clientX);
    const maxDistY = Math.max(clientY, window.innerHeight - clientY);
    const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);
    const scale = (maxRadius * 2) / size;

    gsap.to(overlay, {
      scale: scale,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        logout();

        setTimeout(() => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => overlay.remove(),
          });
        }, 300);
      },
    });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleThemeToggle = (e) => {
    if (document.getElementById("theme-transition-overlay")) return;

    const { clientX, clientY } = e;
    const isDark = theme === "dark";

    // Background color of the TARGET theme
    const targetColor = isDark ? "#ffffff" : "#0f172a";

    const overlay = document.createElement("div");
    overlay.id = "theme-transition-overlay";
    overlay.style.position = "fixed";
    overlay.style.backgroundColor = targetColor;
    overlay.style.borderRadius = "50%";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";

    const size = 10;
    overlay.style.width = `${size}px`;
    overlay.style.height = `${size}px`;
    overlay.style.top = `${clientY - size / 2}px`;
    overlay.style.left = `${clientX - size / 2}px`;
    overlay.style.transformOrigin = "center center";

    document.body.appendChild(overlay);

    const maxDistX = Math.max(clientX, window.innerWidth - clientX);
    const maxDistY = Math.max(clientY, window.innerHeight - clientY);
    const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);
    const scale = (maxRadius * 2) / size;

    gsap.to(overlay, {
      scale: scale,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        toggleTheme();

        setTimeout(() => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => overlay.remove(),
          });
        }, 50);
      },
    });
  };

  // Navigation Links configuration
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Routine Builder", path: "/routine-builder", icon: Calendar },
    { name: "Analytics", path: "/analytics", icon: TrendingUp },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <>
      {/* logout modal here, outside of nav so that it overlays everything */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl shadow-md border-b border-soft"
            : "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm border-b border-soft",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section with Hover Animation */}
            <Link
              to={user ? "/dashboard" : "/login"}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-8 h-8 rounded-xl bg-linear-to-tr from-primary to-[var(--accent)] flex items-center justify-center shadow-sm"
              >
                <span className="text-white font-bold text-xl leading-none tracking-tighter">
                  D
                </span>
              </motion.div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[var(--text-main)] to-primary">
                DailyForge
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        isActive
                          ? "bg-[var(--bg)] text-[var(--text-main)] shadow-sm"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg)]/50 hover:text-[var(--text-main)] dark:text-gray-300 dark:hover:bg-gray-800",
                      )
                    }
                  >
                    <link.icon
                      size={16}
                      className={cn("transition-transform duration-200")}
                    />
                    {link.name}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Premium Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleThemeToggle}
                className="p-2.5 rounded-xl border border-soft text-main hover:bg-[var(--bg)]/30 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer flex items-center justify-center mr-1"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Moon
                    size={18}
                    className="text-[var(--text-main)] fill-[var(--text-main)]/10"
                  />
                ) : (
                  <Sun size={18} className="text-yellow-400 fill-yellow-400" />
                )}
              </motion.button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary hover:text-[var(--text-main)] dark:hover:text-white dark:hover:bg-gray-800 transition-colors px-4 py-2 rounded-xl hover:bg-[var(--bg)]/50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    Signup
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogoutClick}
                  className="btn btn-primary text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-[var(--text-main)] dark:text-white hover:bg-[var(--bg)] dark:hover:bg-gray-800 transition-colors focus:outline-none"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isOpen ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-navigation-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden border-b border-soft bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {user &&
                  navLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 w-full",
                          isActive
                            ? "bg-[var(--bg)] text-[var(--text-main)]"
                            : "text-[var(--text-muted)] dark:text-gray-300 hover:bg-[var(--bg)]/50 dark:hover:bg-gray-800 hover:text-[var(--text-main)]",
                        )
                      }
                    >
                      <link.icon size={18} />
                      {link.name}
                    </NavLink>
                  ))}

                <div
                  className={cn(
                    "flex flex-col gap-2",
                    user ? "pt-4 mt-2 border-t border-[var(--border)]/30" : "pt-2",
                  )}
                >
                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[var(--text-main)] dark:text-gray-300 font-medium hover:bg-[var(--bg)] dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                      >
                        <LogIn size={18} />
                        Login
                      </Link>

                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 btn btn-primary py-3"
                      >
                        <User size={18} />
                        Signup
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center justify-center gap-2 btn btn-primary py-3"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
