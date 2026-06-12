import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const ProtectedRoutes = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4 transition-colors duration-300">
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
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3b8ea0] to-[#4eb7b3] flex items-center justify-center shadow-lg"
        >
          <span className="text-white font-bold text-3xl leading-none tracking-tighter select-none">D</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#3b8ea0] dark:text-[#4eb7b3] text-sm font-bold tracking-widest uppercase select-none mt-2"
        >
          Forging Session...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoutes;