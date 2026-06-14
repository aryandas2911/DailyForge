import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
 // Hide the button on login and root pages
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/";

     // Toggle visibility based on scroll position
     //little changed
  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 100);
  };
// Scroll to top function
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

  // Don't render the button if we are on the login page
  // Force the button to always show on the Tasks page so it's never hidden
  const isTasksPage = location.pathname === "/tasks";
  const shouldShow = isVisible || isTasksPage;

  if (isLoginPage) return null;

  return (
    /* FIXED */
    <div className="fixed right-6 bottom-24 sm:bottom-24 md:bottom-24 lg:bottom-24 z-50">
      {shouldShow && (
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full bg-[var(--primary)] text-white shadow-lg border border-white/10 dark:border-slate-700 hover:bg-[var(--primary-hover)] transition-all duration-300 transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;