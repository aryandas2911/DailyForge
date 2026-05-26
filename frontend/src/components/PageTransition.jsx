import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const LogoDisplay = () => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
      <span className="text-[#4eb7b3] font-bold text-3xl leading-none tracking-tighter">D</span>
    </div>
    <span className="text-4xl font-bold text-white tracking-wide">
      DailyForge
    </span>
  </div>
);

const PageTransition = ({ children }) => {
  return (
    <>
      {children}
      {/* Slide In Overlay (when page exits) */}
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#4eb7b3] flex items-center justify-center pointer-events-none"
        initial={{ x: "100%" }}
        animate={{ x: "100%" }}
        exit={{ x: "0%" }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <LogoDisplay />
      </motion.div>

      {/* Slide Out Overlay (when page enters) */}
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#4eb7b3] flex items-center justify-center pointer-events-none"
        initial={{ x: "0%" }}
        animate={{ x: "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <LogoDisplay />
      </motion.div>
    </>
  );
};

export default PageTransition;
