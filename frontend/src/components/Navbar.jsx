import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging tailwind classes safely
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <nav className="surface-bg fixed top-0 z-20 w-full border-soft shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between p-4">
        
        <Link to={token ? "/dashboard" : "/login"}>
          <span className="text-2xl font-semibold text-main">DailyForge</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              
              <Link
                to="/login"
                className={`btn cursor-pointer focus:outline-none transition-all duration-200 ${
                  location.pathname === "/login"
                    ? "btn-primary"
                    : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                }`}
              >
                
                Login
              </Link>
              
              <Link
                to="/signup"
                className={`btn cursor-pointer focus:outline-none transition-all duration-200 ${
                  location.pathname === "/signup"
                    ? "btn-primary"
                    : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                }`}
              >
              
                Signup
              </Link>
            
            </>
          ) : (
            <button onClick={logout} className="btn btn-primary px-4 py-2 cursor-pointer">
              
              Logout
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