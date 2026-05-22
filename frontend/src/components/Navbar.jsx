import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {motion as Motion,AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, CheckSquare, Calendar, LogOut, LogIn, User, Sun, Moon, TrendingUp } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      >
        <Motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="card w-full max-w-sm text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "rgba(249,115,22,0.12)" }}
          >
            <LogOut size={26} className="text-orange-500" />
          </div>

          {/* Text */}
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-main)" }}>
            Log out of DailyForge?
          </h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--text-muted)" }}>
            You'll need to log back in to access your dashboard, tasks, and routines.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Cancel
            </Motion.button>
            <Motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              Log out
            </Motion.button>
          </div>
        </Motion.div>
      </Motion.div>
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => { setShowLogoutModal(false); setIsOpen(false); logout(); };
  const handleCancelLogout = () => setShowLogoutModal(false);

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

      <Motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={scrolled ? {
          background: "var(--surface)",
          borderBottom: "1px solid var(--surface-border)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          boxShadow: "var(--surface-shadow)",
        } : {
          background: "transparent",
          borderBottom: "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-2 group focus:outline-none">
              <Motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(to top right, var(--primary), var(--accent))" }}
              >
                <span className="text-white font-bold text-xl leading-none tracking-tighter">D</span>
              </Motion.div>
              <span
                className="text-2xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(to right, var(--text-main), var(--primary))" }}
              >
                DailyForge
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className="focus:outline-none"
                  >
                    {({ isActive }) => (
                      <span
                        className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        style={{
                          backgroundColor: isActive ? "rgba(45,168,159,0.12)" : "transparent",
                          color: isActive ? "var(--primary)" : "var(--text-muted)",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.08)";
                        }}
                        onMouseLeave={e => {
                          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <link.icon size={16} />
                        {link.name}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Desktop Auth + Theme Toggle */}
            <div className="hidden md:flex items-center gap-3">
              <Motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.08)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-yellow-400 fill-yellow-400" />
                ) : (
                  <Moon size={18} style={{ color: "var(--primary)" }} />
                )}
              </Motion.button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    style={{ color: "var(--primary)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-primary text-sm">
                    Signup
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogoutClick}
                  className="btn btn-primary text-sm flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl transition-colors focus:outline-none"
                style={{ color: "var(--text-main)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.08)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  <Motion.div
                    key={isOpen ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </Motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--surface-border)",
                backdropFilter: "blur(32px) saturate(180%)",
                WebkitBackdropFilter: "blur(32px) saturate(180%)",
              }}
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {user && navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="focus:outline-none"
                  >
                    {({ isActive }) => (
                      <span
                        className="px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 w-full"
                        style={{
                          backgroundColor: isActive ? "rgba(45,168,159,0.12)" : "transparent",
                          color: isActive ? "var(--primary)" : "var(--text-muted)",
                        }}
                      >
                        <link.icon size={18} />
                        {link.name}
                      </span>
                    )}
                  </NavLink>
                ))}

                {/* Mobile Theme Toggle */}
                <div
                  className="flex items-center justify-between px-4 py-2 mt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--text-main)" }}>
                    Theme Mode
                  </span>
                  <Motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-xl transition-colors focus:outline-none cursor-pointer flex items-center gap-2"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    aria-label="Toggle dark mode"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={16} style={{ color: "var(--primary)" }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--primary)" }}>Dark</span>
                      </>
                    )}
                  </Motion.button>
                </div>

                <div
                  className={cn("flex flex-col gap-2", user ? "pt-4 mt-2" : "pt-2")}
                  style={user ? { borderTop: "1px solid var(--border)" } : {}}
                >
                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
                        style={{ color: "var(--text-main)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
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
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.nav>
    </>
  );
};

export default Navbar;