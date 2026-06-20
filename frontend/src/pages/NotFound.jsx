import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { AuthContext } from "../context/AuthContext.jsx";

const NotFound = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleGoHome = () => {
    navigate(token ? "/dashboard" : "/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-bg px-10 py-14 rounded-3xl w-full max-w-md flex flex-col items-center gap-6 text-center shadow-xl border border-slate-200 dark:border-slate-800"
      >
        <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
          <AlertTriangle size={50} className="text-orange-500" />
        </div>

        <h1 className="text-6xl font-bold text-main">404</h1>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-main">
            Page Not Found
          </h2>

          <p className="text-muted text-sm leading-relaxed">
            Oops! The page you are trying to access does not exist or may have
            been moved.
          </p>
        </div>

        <button
          onClick={handleGoHome}
          className="btn btn-primary hover-lift cursor-pointer px-6 py-3"
        >
          {token ? "Go to Dashboard" : "Go to Login"}
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;