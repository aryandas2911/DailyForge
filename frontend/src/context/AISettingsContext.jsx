import { createContext, useContext, useState } from "react";

const AISettingsContext = createContext(null);

export function AISettingsProvider({ children }) {
  const load = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isPro, setIsPro] = useState(() => load("ai_isPro", false));
  const [aiCoachEnabled, setAiCoachEnabled] = useState(() => load("ai_coach", true));
  const [schedulingEnabled, setSchedulingEnabled] = useState(() => load("ai_scheduling", true));
  const [nudgesEnabled, setNudgesEnabled] = useState(() => load("ai_nudges", true));
  const [nlRoutineEnabled, setNlRoutineEnabled] = useState(() => load("ai_nlRoutine", true));
  const [overloadEnabled, setOverloadEnabled] = useState(() => load("ai_overload", true));

  const toggle = (setter, key) => (val) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  return (
    <AISettingsContext.Provider
      value={{
        isPro,
        setIsPro: toggle(setIsPro, "ai_isPro"),
        aiCoachEnabled,
        setAiCoachEnabled: toggle(setAiCoachEnabled, "ai_coach"),
        schedulingEnabled,
        setSchedulingEnabled: toggle(setSchedulingEnabled, "ai_scheduling"),
        nudgesEnabled,
        setNudgesEnabled: toggle(setNudgesEnabled, "ai_nudges"),
        nlRoutineEnabled,
        setNlRoutineEnabled: toggle(setNlRoutineEnabled, "ai_nlRoutine"),
        overloadEnabled,
        setOverloadEnabled: toggle(setOverloadEnabled, "ai_overload"),
      }}
    >
      {children}
    </AISettingsContext.Provider>
  );
}

export const useAISettings = () => {
  const ctx = useContext(AISettingsContext);
  if (!ctx) throw new Error("useAISettings must be used inside AISettingsProvider");
  return ctx;
};