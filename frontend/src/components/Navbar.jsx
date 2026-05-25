import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, CheckSquare, Calendar, LogOut, LogIn, User, Sun, Moon, TrendingUp, Info } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-[#98e1d7]/30 dark:border-slate-700 p-8 w-full max-w-sm text-center shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-5">
            <LogOut size={26} className="text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Log out of DailyForge?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-7">
            You'll need to log back in to access your dashboard, tasks, and routines.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-[#98e1d7]/50 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setIsOpen(false);
    logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-soft shadow-sm"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-2 group focus:outline-none">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center shadow-sm"
              >
                <span className="text-white font-bold text-xl leading-none tracking-tighter">D</span>
              </motion.div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[#3b8ea0] to-[#4eb7b3]">
                DailyForge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {/* About link - visible to all users */}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive
                      ? "bg-[#d0f6e3] text-[#3b8ea0] shadow-sm"
                      : "text-[#4eb7b3] hover:bg-[#d0f6e3]/50 hover:text-[#3b8ea0]"
                  )
                }
              >
                <Info size={16} />
                About
              </NavLink>

              {user && navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      isActive
                        ? "bg-[#d0f6e3] text-[#3b8ea0] shadow-sm"
                        : "text-[#4eb7b3] hover:bg-[#d0f6e3]/50 hover:text-[#3b8ea0]"
                    )
                  }
                >
                  <link.icon size={16} />
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-soft text-main hover:bg-[#d0f6e3]/30 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer flex items-center justify-center mr-1"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-yellow-400 fill-yellow-400" />
                ) : (
                  <Moon size={18} className="text-[#3b8ea0] fill-[#3b8ea0]/10" />
                )}
              </motion.button>

              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    end
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-medium transition-colors px-4 py-2 rounded-xl border-2",
                        isActive
                          ? "border-[#3b8ea0] text-[#3b8ea0] bg-[#d0f6e3]"
                          : "border-transparent text-[#4eb7b3] hover:bg-[#d0f6e3]/50"
                      )
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    end
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-medium transition-colors px-4 py-2 rounded-xl border-2",
                        isActive
                          ? "border-[#3b8ea0] text-white bg-[#3b8ea0]"
                          : "border-[#4eb7b3] text-[#4eb7b3] bg-transparent hover:bg-[#d0f6e3]/50"
                      )
                    }
                  >
                    Signup
                  </NavLink>
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

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-[#3b8ea0] hover:bg-[#d0f6e3] transition-colors focus:outline-none"
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

        {/* Mobile Navigation */}
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
                {/* About - visible to all */}
                <NavLink
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 w-full",
                      isActive
                        ? "bg-[#d0f6e3] text-[#3b8ea0]"
                        : "text-[#4eb7b3] hover:bg-[#d0f6e3]/50 hover:text-[#3b8ea0]"
                    )
                  }
                >
                  <Info size={18} />
                  About
                </NavLink>

                {user && navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 w-full",
                        isActive
                          ? "bg-[#d0f6e3] text-[#3b8ea0]"
                          : "text-[#4eb7b3] hover:bg-[#d0f6e3]/50 hover:text-[#3b8ea0]"
                      )
                    }
                  >
                    <link.icon size={18} />
                    {link.name}
                  </NavLink>
                ))}

                <div className="flex items-center justify-between px-4 py-2 border-t border-soft/30 mt-2">
                  <span className="text-sm font-medium text-main">Theme Mode</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-soft text-main hover:bg-[#d0f6e3]/30 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer flex items-center gap-2"
                    aria-label="Toggle dark mode"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={16} className="text-[#3b8ea0] fill-[#3b8ea0]/10" />
                        <span className="text-xs text-[#3b8ea0] font-semibold uppercase tracking-wider">Dark</span>
                      </>
                    )}
                  </motion.button>
                </div>

                <div className={cn("flex flex-col gap-2", user ? "pt-4 mt-2 border-t border-[#98e1d7]/30" : "pt-2")}>
                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[#3b8ea0] font-medium hover:bg-[#d0f6e3] transition-colors"
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
