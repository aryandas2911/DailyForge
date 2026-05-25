import { useEffect, useState } from "react";
import Turnstile from "react-turnstile";

export default function Captcha({ onVerify, theme: forcedTheme, size = "normal", className = "" }) {
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    // If a theme is explicitly passed, use it
    if (forcedTheme && forcedTheme !== "auto") {
      setCurrentTheme(forcedTheme);
      return;
    }

    // Otherwise, check if the UI is in dark mode
    const isDark = document.documentElement.classList.contains("dark");
    setCurrentTheme(isDark ? "dark" : "light");

    // Watch for theme changes if you have a toggle
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDarkNow ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [forcedTheme]);

  return (
    <div className={`flex justify-center py-2 ${className}`}>
      <Turnstile
        sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onVerify={onVerify}
        theme={currentTheme}
        size={size}
      />
    </div>
  );
}
