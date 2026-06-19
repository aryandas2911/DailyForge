import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Hide the button on login, root, and forge/focus mode pages
  const isLoginPage = location.pathname === "/login" || location.pathname === "/" || location.pathname === "/forge" || location.pathname === "/focus";

  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  const isTasksPage = location.pathname === "/tasks";
  const shouldShow = isVisible || isTasksPage;

  if (isLoginPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {shouldShow && (
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full bg-[#3b8ea0] text-white shadow-lg border border-white/10 dark:border-slate-700 hover:bg-[#4eb7b3] transition-all duration-300 transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#3b8ea0] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;