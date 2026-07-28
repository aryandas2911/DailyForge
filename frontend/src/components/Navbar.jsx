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
  Timer,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import gsap from "gsap";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
          <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed mb-7">
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
    return () => {
      document.body.style.overflow = "";
    };
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

    const overlay = document.createElement("div");
    overlay.id = "theme-transition-overlay";

    overlay.style.position = "fixed";
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
      scale,
      duration: 0.75,
      ease: "power3.inOut",
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


  if (location.pathname === "/forge" || location.pathname === "/focus") {
    return null;
  }

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
          "fixed top-4 inset-x-0 z-50 px-3 sm:px-5 transition-all duration-500",
          scrolled ? "translate-y-0" : "translate-y-0",
        )}
      >
        <div
          className={cn(
            "relative mx-auto max-w-7xl overflow-hidden rounded-full border transition-all duration-500",
            "border-white/60 bg-white/68 shadow-[0_18px_60px_rgba(15,23,42,0.12),0_1px_0_rgba(255,255,255,0.75)_inset]",
            "backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/58 dark:shadow-[0_22px_70px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.08)_inset]",
            scrolled
              ? "max-w-6xl bg-white/78 shadow-[0_16px_55px_rgba(15,23,42,0.16),0_1px_0_rgba(255,255,255,0.86)_inset] dark:bg-slate-950/72"
              : "max-w-7xl",
          )}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_14%_50%,rgba(78,183,179,0.24),transparent_26%),radial-gradient(circle_at_86%_12%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.52),rgba(255,255,255,0.12))] dark:bg-[radial-gradient(circle_at_14%_50%,rgba(78,183,179,0.24),transparent_28%),radial-gradient(circle_at_84%_10%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/18" />

          <div className="relative flex h-[4.25rem] items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">
            {/* Logo Section with Hover Animation */}
            <Link
              to={user ? "/dashboard" : "/login"}
              className="group flex min-w-0 items-center gap-3 rounded-full pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45"
            >
              <motion.div
                whileHover={{ rotate: -8, scale: 1.06 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#162033] via-[#256a78] to-[#76e4d0] shadow-[0_12px_30px_rgba(78,183,179,0.36)] ring-1 ring-white/50 dark:from-[#0b1020] dark:via-[#173c52] dark:to-[#4eb7b3] dark:ring-white/12"
              >
                <span className="absolute inset-1 rounded-full bg-white/12 blur-[1px]" />
                <span className="relative text-white font-black text-xl leading-none tracking-tighter">
                  D
                </span>
              </motion.div>
              <span className="min-w-0">
                <span className="block text-[1.12rem] font-black leading-none tracking-normal bg-clip-text text-transparent bg-linear-to-r from-slate-950 via-[#267985] to-[#4eb7b3] dark:from-white dark:via-[#d9fffb] dark:to-[#6ee7d8] sm:text-[1.36rem]">
                  DailyForge
                </span>
                <span className="mt-0.5 hidden text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#3b8ea0]/70 dark:text-slate-400 lg:block">
                  Momentum OS
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden xl:flex items-center rounded-full border border-slate-900/5 bg-white/42 p-1 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] dark:border-white/8 dark:bg-white/[0.04]">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-300",
                        isActive
                          ? "text-slate-950 dark:text-white"
                          : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="desktop-active-pill"
                          className="absolute inset-0 rounded-full border border-white/70 bg-white/78 shadow-[0_10px_28px_rgba(15,23,42,0.12),0_1px_0_rgba(255,255,255,0.88)_inset] dark:border-white/10 dark:bg-white/[0.10] dark:shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <link.icon
                        size={15}
                        className={cn(
                          "relative transition-transform duration-300 group-hover:-translate-y-0.5",
                          isActive ? "text-[#3b8ea0]" : "text-current",
                        )}
                      />
                      <span className="relative whitespace-nowrap">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Desktop Auth Buttons */}
            <div className="hidden xl:flex items-center gap-2.5">
              {/* Premium Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.06, rotate: 8 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleThemeToggle}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/8 bg-white/48 text-main shadow-[0_1px_0_rgba(255,255,255,0.75)_inset] transition-colors hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45 dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.10]"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Moon
                    size={18}
                    className="text-[#3b8ea0] fill-[#3b8ea0]/10"
                  />
                ) : (
                  <Sun size={18} className="text-yellow-400 fill-yellow-400" />
                )}
              </motion.button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="group relative overflow-hidden rounded-full border border-slate-900/8 bg-white/42 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-950 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.10] dark:hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(78,183,179,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45 dark:bg-white dark:text-slate-950"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-[#4eb7b3]/0 via-[#4eb7b3]/18 to-[#4eb7b3]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative">Signup</span>
                    <ArrowRight size={15} className="relative transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  {/*pomodoro focus mode*/}

                  <Link
                    to="/focus-mode"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#4eb7b3]/25 bg-[#4eb7b3]/12 px-4 py-2.5 text-sm font-extrabold text-[#24717a] shadow-[0_10px_28px_rgba(78,183,179,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4eb7b3]/18 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45 dark:border-[#6ee7d8]/25 dark:bg-[#6ee7d8]/10 dark:text-[#b9fffa]"
                  >
                    <Timer size={16} className="transition-transform duration-300 group-hover:-rotate-6" />
                    Focus Mode
                  </Link>

                  <button
                    onClick={handleLogoutClick}
                    className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(15,23,42,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(78,183,179,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45 dark:bg-white dark:text-slate-950"
                  >
                    <LogOut size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="xl:hidden flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/8 bg-white/48 shadow-[0_1px_0_rgba(255,255,255,0.75)_inset] transition-colors dark:border-white/10 dark:bg-white/[0.05]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <Moon size={18} className="text-[#6ee7d8]" />
                ) : (
                  <Sun size={18} className="text-amber-400 fill-amber-400" />
                )}
              </motion.button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                ref={toggleRef}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4eb7b3]/45 dark:bg-white dark:text-slate-950"
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
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
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
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="xl:hidden overflow-hidden"
            >
              <div
                ref={menuRef}
                className="mx-2 mb-2 mt-1 rounded-[1.75rem] border border-white/60 bg-white/76 p-2 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82 dark:shadow-[0_22px_70px_rgba(0,0,0,0.42)]"
              >
                {user &&
                  navLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "px-4 py-3 rounded-2xl text-base font-bold transition-all duration-200 flex items-center gap-3 w-full",
                          isActive
                            ? "bg-white text-slate-950 shadow-md dark:bg-white/[0.10] dark:text-white"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/[0.07] hover:text-slate-950 dark:hover:text-white",
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
                    user ? "pt-3 mt-2 border-t border-[#98e1d7]/30 dark:border-white/10" : "pt-1",
                  )}
                >
                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-200 font-bold hover:bg-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white transition-colors"
                      >
                        <LogIn size={18} />
                        Login
                      </Link>

                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-extrabold text-white shadow-lg dark:bg-white dark:text-slate-950"
                      >
                        <Sparkles size={18} />
                        Signup
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/focus-mode"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#4eb7b3]/25 bg-[#4eb7b3]/12 px-4 py-3 font-extrabold text-[#24717a] dark:text-[#b9fffa]"
                      >
                        <Timer size={18} />
                        Focus Mode
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-extrabold text-white shadow-lg dark:bg-white dark:text-slate-950"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </>
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
