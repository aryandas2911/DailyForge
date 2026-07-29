export default function InsightCard({ insights }) {
  return (
    <div className="bg-(--surface) rounded-xl shadow-md p-5">
      <h2 className="text-lg font-semibold text-main dark:text-white mb-4">Insights</h2>
      <ul className="space-y-3 text-sm text-main dark:text-slate-200">
        {insights?.map((insight, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-(--primary) shrink-0">{insight.icon}</span>
            <span className="text-main dark:text-slate-200">{insight.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
