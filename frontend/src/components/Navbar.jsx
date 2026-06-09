import { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-sm text-center shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-5">
            <LogOut size={26} className="text-orange-500" />
          </div>

          <h2 className="text-lg font-semibold mb-2">
            Log out of DailyForge?
          </h2>

          <p className="text-sm text-slate-500 mb-7">
            You’ll need to log back in to access your dashboard.
          </p>

          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border">
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white"
            >
              Log out
            </button>
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleConfirmLogout = (e) => {
    setShowLogoutModal(false);
    setIsOpen(false);

    if (!e || !e.clientX) {
      logout();
      return;
    }

    const { clientX, clientY } = e;

    const overlay = document.createElement("div");
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

    document.body.appendChild(overlay);

    const maxDistX = Math.max(clientX, window.innerWidth - clientX);
    const maxDistY = Math.max(clientY, window.innerHeight - clientY);
    const scale = (Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) * 2) / size;

    gsap.to(overlay, {
      scale,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        logout();
        setTimeout(() => overlay.remove(), 300);
      },
    });
  };

  const handleCancelLogout = () => setShowLogoutModal(false);

  const handleThemeToggle = (e) => {
    if (document.getElementById("theme-transition-overlay")) return;

    const { clientX, clientY } = e;
    const isDark = theme === "dark";
    const targetColor = isDark ? "#ffffff" : "#0f172a";

    const overlay = document.createElement("div");
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

    document.body.appendChild(overlay);

    const maxDistX = Math.max(clientX, window.innerWidth - clientX);
    const maxDistY = Math.max(clientY, window.innerHeight - clientY);
    const scale = (Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) * 2) / size;

    gsap.to(overlay, {
      scale,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        toggleTheme();
        setTimeout(() => overlay.remove(), 50);
      },
    });
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Routine Builder", path: "/routine-builder", icon: Calendar },
    { name: "Analytics", path: "/analytics", icon: TrendingUp },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />

      <motion.nav
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all",
          scrolled
            ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-bold text-[#3b8ea0]">
                DailyForge
              </span>
            </Link>

            {/* Desktop Nav */}
            {user && (
              <div className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => (
                  <NavLink key={link.name} to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-2 rounded-xl text-sm",
                        isActive ? "bg-[#d0f6e3]" : "text-[#4eb7b3]"
                      )
                    }
                  >
                    <link.icon size={16} />
                    {link.name}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Auth */}
            <div className="hidden md:flex items-center gap-4">

              <button onClick={handleThemeToggle} className="p-2 rounded-xl">
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {!user ? (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Signup</Link>
                </>
              ) : (
                <button onClick={handleLogoutClick}>
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>

          </div>
        </div>

        {/* ✅ SINGLE Mobile Menu ONLY */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden bg-white dark:bg-slate-900"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="p-4 space-y-2">
                {user &&
                  navLinks.map((link) => (
                    <NavLink key={link.name} to={link.path} onClick={() => setIsOpen(false)}>
                      {link.name}
                    </NavLink>
                  ))}

                {!user ? (
                  <>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                  </>
                ) : (
                  <button onClick={handleLogoutClick}>Logout</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>
    </>
  );
};

export default Navbar;