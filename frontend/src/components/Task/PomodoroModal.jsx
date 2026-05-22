import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Play, Pause, RotateCcw } from "lucide-react";

export default function PomodoroModal({ task, onClose }) {
  const DEFAULT_TIME = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Play a simple notification sound using browser API if supported
      try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
        audio.play().catch(e => console.log("Audio play prevented by browser", e));
      } catch(e) {
        console.log(e);
      }
      alert(`Time's up for task: ${task.title}!`);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, task]);

  // Handle body scroll lock
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflowY = "scroll";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflowY = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-(--surface) rounded-2xl shadow-xl w-full max-w-sm p-8 text-center relative border border-soft animate-in delay-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-main hover:bg-gray-100 dark:hover:bg-slate-700"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-main mb-2">Focus Session</h2>
        <p className="text-sm text-muted mb-6">{task.title}</p>

        <div className="text-6xl font-bold text-main mb-8 font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 active:scale-95 ${
              isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} />}
            {isActive ? "Pause" : "Start"}
          </button>

          <button
            onClick={resetTimer}
            className="p-3 rounded-xl text-main bg-soft hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
