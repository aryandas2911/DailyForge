export default function StatCard({ label, value, subtitle, icon }) {
  return (
    <div className="card flex items-start gap-4">
      <div className="text-primary">{icon}</div>

      <div>
        <p className="text-xs text-muted dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-main">{value}</p>
        {subtitle && <p className="text-xs text-muted dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
