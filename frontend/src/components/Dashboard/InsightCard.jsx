export default function InsightCard({ insights }) {
  return (
    <div className="card h-full flex flex-col justify-center">
      <h2 className="text-sm font-semibold text-main mb-3 uppercase tracking-wide">Insights</h2>
      <ul className="space-y-3 text-sm text-main">
        {insights?.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span className="text-(--primary) text-base">{insight.icon}</span>
            <span className="mt-0.5">{insight.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
