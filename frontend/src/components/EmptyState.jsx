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
        <rect x="10" y="18" width="60" height="8" rx="4" fill="#3b8ea0" opacity="0.18" />
        <rect x="10" y="34" width="45" height="8" rx="4" fill="#3b8ea0" opacity="0.13" />
        <rect x="10" y="50" width="52" height="8" rx="4" fill="#3b8ea0" opacity="0.10" />
        <circle cx="56" cy="52" r="18" fill="#3b8ea0" opacity="0.15" />
        <path
          d="M46 52l6 6 12-12"
          stroke="#3b8ea0"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="10" y="10" width="32" height="4" rx="2" fill="#3b8ea0" opacity="0.35" />
      </svg>
    ),
    heading: "No tasks yet",
    subtext: "Your to-do list is empty. Add your first task and start crushing the day.",
    cta: "+ Create your first task",
  },
  routines: {
    icon: (
      <svg 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{ width: 80, height: 80 }}
      >
        <circle cx="40" cy="40" r="28" stroke="#4eb7b3" strokeWidth="3" opacity="0.2" />
        <circle cx="40" cy="40" r="28" stroke="#4eb7b3" strokeWidth="3" strokeDasharray="44 132" strokeLinecap="round" opacity="0.7" />
        <circle cx="40" cy="40" r="3" fill="#4eb7b3" />
        <path d="M40 40 V20" stroke="#4eb7b3" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 40 L54 48" stroke="#4eb7b3" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <circle cx="40" cy="12" r="3" fill="#4eb7b3" opacity="0.4" />
        <circle cx="68" cy="40" r="3" fill="#4eb7b3" opacity="0.25" />
        <circle cx="12" cy="40" r="3" fill="#4eb7b3" opacity="0.25" />
        <circle cx="40" cy="68" r="3" fill="#4eb7b3" opacity="0.25" />
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
    <div className="relative flex flex-col items-center justify-center gap-5 px-8 py-14 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 max-w-[420px] mx-auto text-center overflow-hidden transition-colors duration-300 shadow-sm animate-in">
      <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-radial from-[#4eb7b3]/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-center w-[100px] h-[100px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 shadow-xs mb-1">
        {cfg.icon}
      </div>

      <div className="space-y-1.5">
        <h2 className="m-0 text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          {cfg.heading}
        </h2>
        <p className="m-0 text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-[300px]">
          {cfg.subtext}
        </p>
      </div>

      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onAction}
        className={`mt-2 px-7 py-3 rounded-xl border-none bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white font-bold text-sm cursor-pointer shadow-xs transition-all duration-200 ${
          hovered ? "translate-y-[-2px] scale-[1.02] shadow-md" : ""
        }`}
      >
        {cfg.cta}
      </button>
    </div>
  );
}