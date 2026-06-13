import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

export const XPContext = createContext(null);

const XPProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [xpData, setXpData] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Fetch XP from backend
  const fetchXP = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/xp");
      if (res.data.success) {
        setXpData(res.data.xp);
      }
    } catch (err) {
      console.error("XP fetch failed:", err);
    }
  }, [user]);

  // Call after a task is completed — show toast and re-fetch
  const triggerXPReward = useCallback(({ xpAwarded, xpEvents }) => {
    if (!xpAwarded || xpAwarded <= 0) return;

    const label = xpEvents?.length > 1
      ? `+${xpAwarded} XP  (${xpEvents.map(e => e.reason.replace("Completed task: ", "")).join(" + ")})`
      : `+${xpAwarded} XP`;

    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ amount: xpAwarded, label });
    toastTimer.current = setTimeout(() => setToast(null), 3000);

    fetchXP();
  }, [fetchXP]);

  // Fetch on login
  useEffect(() => {
    fetchXP();
  }, [fetchXP]);

  return (
    <XPContext.Provider value={{ xpData, fetchXP, triggerXPReward, toast }}>
      {children}
    </XPContext.Provider>
  );
};

export default XPProvider;