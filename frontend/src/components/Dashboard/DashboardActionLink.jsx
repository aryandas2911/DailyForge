import { ArrowRight } from "lucide-react";

export default function DashboardActionLink({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-soft bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-primary focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors cursor-pointer ${className}`}
    >
      {children}
      <ArrowRight size={14} aria-hidden />
    </button>
  );
}
