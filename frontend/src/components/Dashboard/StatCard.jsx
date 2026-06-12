export default function StatCard({ label, value, subtitle, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-colors duration-300">
      <div className="text-[#3b8ea0] dark:text-[#4eb7b3] mt-0.5 flex-shrink-0 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}