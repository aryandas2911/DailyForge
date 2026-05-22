import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0f172a] gap-4 transition-colors duration-300">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center shadow-lg"
        >
          <span className="text-white font-bold text-3xl leading-none tracking-tighter select-none">D</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#3b8ea0] dark:text-[#4eb7b3] text-sm font-semibold tracking-widest uppercase select-none mt-2"
        >
          Forging Session...
        </motion.div>
      </div>
    );
  }

  // If user is authenticated, redirect them to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
