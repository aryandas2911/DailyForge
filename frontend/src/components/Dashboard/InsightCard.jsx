export default function InsightCard({ insights }) {
  return (
    <div className="bg-(--surface) rounded-xl shadow-md p-5 transition-shadow hover:shadow-lg">

    <h2 className="text-lg font-semibold text-main mb-5">Insights</h2>
      <ul className="space-y-3 text-sm text-main">
        {insights?.map((insight, i) => (
          <li key={i} className="flex items-start gap-3" aria-label="Productivity insights" >
            <span className="text-(--primary) shrink-0 mt-0.5">{insight.icon}</span>
            <span>{insight.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
