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
        <motion.img
          src="/logo.svg"
          alt="DailyForge"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-16 w-auto select-none"
        />
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
