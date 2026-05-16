import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, CheckSquare, Calendar, LogOut, LogIn, UserPlus } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging tailwind classes safely
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logout();
      setIsOpen(false);
    }
  };

  // Navigation Links configuration
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Routine Builder", path: "/routine-builder", icon: Calendar },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-soft shadow-sm" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section with Hover Animation */}
          <Link to={token ? "/dashboard" : "/login"} className="flex items-center gap-2 group focus:outline-none">
            <motion.div 
              whileHover={{ rotate: 180 }} 
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center shadow-sm"
            >
              <span className="text-white font-bold text-xl leading-none tracking-tighter">D</span>
            </motion.div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3b8ea0] to-[#4eb7b3]">
              DailyForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          {token && (
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
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
                  <link.icon size={16} className={cn("transition-transform duration-200")} />
                  {link.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#4eb7b3] hover:text-[#3b8ea0] transition-colors px-4 py-2 rounded-xl hover:bg-[#d0f6e3]/50"
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
                onClick={handleLogout} 
                className="btn btn-primary text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-[#3b8ea0] hover:bg-[#d0f6e3] transition-colors focus:outline-none"
              aria-label="Toggle menu"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-b border-soft bg-white/95 backdrop-blur-xl overflow-hidden"
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
                        ? "bg-[#d0f6e3] text-[#3b8ea0]"
                        : "text-[#4eb7b3] hover:bg-[#d0f6e3]/50 hover:text-[#3b8ea0]"
                    )
                  }
                >
                  <link.icon size={18} />
                  {link.name}
                </NavLink>
              ))}

              <div className={cn("flex flex-col gap-2", token ? "pt-4 mt-2 border-t border-[#98e1d7]/30" : "pt-2")}>
                {!token ? (
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
