export default function InsightCard({ insights }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 w-full box-border">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">Insights</h2>
      {(!insights || insights.length === 0) ? (
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 italic py-2">
          No automated baseline insights compiled for this scheduling window yet.
        </p>
      ) : (
        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 pl-0 mt-0 list-none">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-3 font-semibold leading-relaxed transition-all animate-in">
              <span className="text-[#3b8ea0] dark:text-[#4eb7b3] mt-0.5 shrink-0 flex items-center justify-center">
                {insight.icon}
              </span>
              <span className="text-slate-700 dark:text-slate-300 break-words">{insight.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}