import React from "react";

// Custom Toast component for global use
const CustomToast = ({ message, type }) => {
  if (!message) return null;

  const base =
    "fixed bottom-6 right-6 z-[1001] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300";
  const color = type === "success" ? "bg-green-500" : "bg-red-500";

  return <div className={`${base} ${color}`}>{message}</div>;
};

export default CustomToast;