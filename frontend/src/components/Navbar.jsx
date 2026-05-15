import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;