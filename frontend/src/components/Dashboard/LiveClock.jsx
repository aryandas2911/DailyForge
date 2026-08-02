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
    <p className="text-xs font-bold text-[#3b8ea0] dark:text-[#4eb7b3] font-mono tracking-wider select-none mt-1">
      {currentTime}
    </p>
  );
};

export default LiveClock;