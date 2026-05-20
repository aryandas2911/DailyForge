import { useState } from "react";

const CONFIG = {
  tasks: {
  icon: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 80, height: 80 }}
    >
      <rect x="10" y="18" width="60" height="8" rx="4" fill="#1d4ed8" opacity="0.18" />
      <rect x="10" y="34" width="45" height="8" rx="4" fill="#1d4ed8" opacity="0.13" />
      <rect x="10" y="50" width="52" height="8" rx="4" fill="#1d4ed8" opacity="0.10" />
      <circle cx="56" cy="52" r="18" fill="#1d4ed8" opacity="0.15" />
      <path
        d="M46 52l6 6 12-12"
        stroke="#1d4ed8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="10" y="10" width="32" height="4" rx="2" fill="#1d4ed8" opacity="0.35" />
    </svg>
  ),
  heading: "No tasks yet",
  subtext: "Your to-do list is empty. Add your first task and start crushing the day.",
  cta: "+ Create your first task",
},
  routines: {
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
        <circle cx="40" cy="40" r="28" stroke="#6366f1" strokeWidth="3" opacity="0.2" />
        <circle cx="40" cy="40" r="28" stroke="#6366f1" strokeWidth="3" strokeLinedasharray="44 132" strokeLinecap="round" opacity="0.7" />
        <circle cx="40" cy="40" r="3" fill="#6366f1" />
        <path d="M40 40 V20" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 40 L54 48" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <circle cx="40" cy="12" r="3" fill="#6366f1" opacity="0.4" />
        <circle cx="68" cy="40" r="3" fill="#6366f1" opacity="0.25" />
        <circle cx="12" cy="40" r="3" fill="#6366f1" opacity="0.25" />
        <circle cx="40" cy="68" r="3" fill="#6366f1" opacity="0.25" />
      </svg>
    ),
    heading: "No routines saved",
    subtext: "Build consistent habits by creating your first daily routine.",
    cta: "+ Create your first routine",
  },
};

export default function EmptyState({ type = "tasks", onAction }) {
  const [hovered, setHovered] = useState(false);
  const cfg = CONFIG[type] ?? CONFIG.tasks;

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 px-8 py-14 rounded-[20px] bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800/30 dark:to-slate-800/50 border border-dashed border-purple-200 dark:border-slate-700 max-w-[420px] mx-auto text-center overflow-hidden font-sans shadow-xs">
      <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-radial from-purple-500/10 to-transparent pointer-events-none" />
      <div className="flex items-center justify-center w-[100px] h-[100px] rounded-full bg-purple-100/50 dark:bg-slate-800/80 shadow-[0_0_0_12px_rgba(245,243,255,0.5),0_0_0_20px_rgba(237,233,254,0.3)] dark:shadow-[0_0_0_12px_rgba(30,41,59,0.3),0_0_0_20px_rgba(15,23,42,0.2)] mb-1">
        {cfg.icon}
      </div>

      <h2 className="m-0 text-xl font-bold text-blue-900 dark:text-blue-400 tracking-tight">
        {cfg.heading}
      </h2>

      <p className="m-0 text-sm text-blue-900 dark:text-blue-200 leading-relaxed max-w-[300px]">
        {cfg.subtext}
      </p>

      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onAction}
        className={`mt-2 px-7 py-3 rounded-xl border-none bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.4)] transition-all duration-200 ${
          hovered ? "translate-y-[-2px] shadow-[0_8px_20px_rgba(99,102,241,0.55)] scale-[1.02]" : ""
        }`}
      >
        {cfg.cta}
      </button>
    </div>
  );
}



