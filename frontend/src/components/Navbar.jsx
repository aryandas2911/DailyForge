import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmed) {
      logout();
    }
  };

  return (
    <nav className="surface-bg fixed top-0 z-20 w-full border-soft shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between p-4">
        <Link to={token ? "/dashboard" : "/login"}>
          <span className="text-2xl font-semibold text-main">
            DailyForge
          </span>
        </Link>

        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
};

export default Navbar;
