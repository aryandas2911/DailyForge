// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="
        p-2.5 rounded-xl
        border border-soft

        text-main

        hover:bg-[#d0f6e3]/30
        dark:hover:bg-slate-800

        transition-colors
        focus:outline-none
        cursor-pointer
        flex items-center justify-center
      "
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-yellow-400 fill-yellow-400" />
      ) : (
        <Moon size={18} className="text-[#3b8ea0] fill-[#3b8ea0]/10" />
      )}
    </motion.button>
  );
}