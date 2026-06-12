import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const NotFound = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleGoHome = () => {
    navigate(token ? "/dashboard" : "/login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3b8ea0]/10 dark:bg-[#3b8ea0]/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4eb7b3]/10 dark:bg-[#4eb7b3]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-12 rounded-3xl w-full max-w-md flex flex-col items-center gap-6 text-center shadow-xl z-10 box-border animate-in">
        <h1 className="text-6xl font-black bg-gradient-to-r from-[#3b8ea0] via-[#4eb7b3] to-[#98e1d7] bg-clip-text text-transparent uppercase tracking-tight py-1">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xs">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <button
          onClick={handleGoHome}
          className="w-full py-3 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer mt-2"
        >
          {token ? "Go to Dashboard" : "Go to Login"}
        </button>
      </div>
    </div>
  );
};

export default NotFound;