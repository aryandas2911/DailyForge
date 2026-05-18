import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, CheckSquare, Calendar, LogOut, LogIn, UserPlus, Sun, Moon } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    queueMicrotask(()=>{
    setIsOpen(false);});
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Routine Builder", path: "/routine-builder", icon: Calendar },
  ];

  return (
    <Motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
             <Link to={token ? "/dashboard" : "/login"} className="flex items-center gap-2 group focus:outline-none">
            <Motion.div 
              whileHover={{ rotate: 180 }} 
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center shadow-sm"
            >
              <span className="text-white font-bold text-xl leading-none tracking-tighter">D</span>
            </Motion.div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3b8ea0] to-[#4eb7b3]">
              DailyForge
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {token && (
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ",
                      isActive
                        ? "bg-bg text-text-main shadow-sm bg-[var(--accent)]"
                        : "text-primary hover:bg-bg/50 hover:text-text-main hover:bg-[var(--primary)]"
                    )
                  }
                >
                  <link.icon size={16} />
                  {link.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Desktop Auth + Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border text-text-main hover:bg-bg/30 transition-colors focus:outline-none cursor-pointer flex items-center justify-center mr-1"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400 fill-yellow-400" />
              ) : (
                <Moon size={18} className="text-text-main" />
              )}
            </Motion.button>

            {!token ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary hover:text-text-main transition-colors px-4 py-2 rounded-xl hover:bg-bg/50"
                >
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary text-sm shadow-md hover:shadow-lg transition-all">
                  Signup
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="btn btn-primary text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
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
              className="p-2 rounded-xl text-text-main hover:bg-bg transition-colors focus:outline-none"
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
            className="md:hidden border-b border-border bg-surface/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {token && navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 w-full",
                      isActive
                        ? "bg-bg text-text-main"
                        : "text-primary hover:bg-bg/50 hover:text-text-main"
                    )
                  }
                >
                  <link.icon size={18} />
                  {link.name}
                </NavLink>
              ))}

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border mt-2">
                <span className="text-sm font-medium text-text-main">Theme Mode</span>
                <Motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-border text-text-main hover:bg-bg/30 transition-colors focus:outline-none cursor-pointer flex items-center gap-2"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-text-main" />
                      <span className="text-xs text-text-main font-semibold uppercase tracking-wider">Dark</span>
                    </>
                  )}
                </Motion.button>
              </div>

              <div className={cn("flex flex-col gap-2", token ? "pt-4 mt-2 border-t border-border" : "pt-2")}>
                {!token ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-text-main font-medium hover:bg-bg transition-colors"
                    >
                      <LogIn size={18} />
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 btn btn-primary py-3"
                    >
                      <UserPlus size={18} />
                      Signup
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
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
  );
};

export default Navbar;