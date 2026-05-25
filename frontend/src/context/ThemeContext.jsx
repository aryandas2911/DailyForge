/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

const getTimeBasedTheme = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "evening";
  } else {
    return "night";
  }
};

export const ThemeProvider = ({ children }) => {
  const [userThemeOverride, setUserThemeOverride] = useState(() => {
    return localStorage.getItem("userThemeOverride") || null;
  });

  const [timeBasedTheme, setTimeBasedTheme] = useState(getTimeBasedTheme);

  const isAutomatic = userThemeOverride === null;
  const currentTheme = isAutomatic ? timeBasedTheme : userThemeOverride;

  useEffect(() => {
    const updateTimeBasedTheme = () => {
      setTimeBasedTheme(getTimeBasedTheme());
    };

    const interval = setInterval(updateTimeBasedTheme, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    if (isAutomatic) {
      setUserThemeOverride("light");
      localStorage.setItem("userThemeOverride", "light");
    } else {
      const nextTheme =
        userThemeOverride === "light" ? "dark" : "light";
      setUserThemeOverride(nextTheme);
      localStorage.setItem("userThemeOverride", nextTheme);
    }
  };

  const resetToAutomatic = () => {
    setUserThemeOverride(null);
    localStorage.removeItem("userThemeOverride");
  };

  useEffect(() => {
    const root = window.document.documentElement;

    root.setAttribute("data-theme", currentTheme);

    if (
      currentTheme === "dark" ||
      currentTheme === "night" ||
      (currentTheme === "evening" && userThemeOverride)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [currentTheme, userThemeOverride]);

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isAutomatic,
        userThemeOverride,
        toggleTheme,
        resetToAutomatic,
        timeBasedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
