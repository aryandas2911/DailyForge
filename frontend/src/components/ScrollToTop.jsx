import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const isLoginPage = location.pathname === "/login" || location.pathname === "/";
  const isTasksPage = location.pathname === "/tasks";

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

  if (isLoginPage) return null;

  const shouldShow = isVisible || isTasksPage;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {shouldShow && (
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
            focusRingColor: "var(--color-primary)",
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;