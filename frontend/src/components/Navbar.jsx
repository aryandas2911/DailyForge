import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmed) {
      logout();
    }
  };

  return (
    <nav className="surface-bg fixed top-0 z-50 w-full border-soft shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between p-4">
        <Link to={token ? "/dashboard" : "/login"}>
          <span className="text-2xl font-semibold text-main">
            DailyForge
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-muted hover:text-main transition-colors font-medium cursor-pointer"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="btn btn-primary cursor-pointer"
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="btn btn-primary px-4 py-2 cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-main focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden surface-bg border-t border-soft animate-in shadow-lg">
          <div className="flex flex-col p-4 gap-4">
            {!token ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-muted hover:text-main transition-colors font-medium py-2 border-b border-soft/30"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Signup
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="btn btn-primary w-full"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
