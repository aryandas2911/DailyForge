import { useEffect, useState } from "react";

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setCurrentTime(formattedTime);
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-sm font-semibold tracking-wider text-accent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] bg-slate-900/5 dark:bg-slate-800/50 px-3 py-1 rounded-lg border border-accent/20">
      {currentTime}
    </p>
  );
};

export default LiveClock;