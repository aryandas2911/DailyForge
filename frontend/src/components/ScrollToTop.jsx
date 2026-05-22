import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const isLoginPage = location.pathname === "/login" || location.pathname === "/";
  const isTasksPage = location.pathname === "/tasks";
  const shouldShow = isVisible || isTasksPage;

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 100);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  if (isLoginPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {shouldShow && (
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: "var(--primary)",
            focusRingColor: "var(--primary)",
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--primary-hover)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--primary)"}
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;