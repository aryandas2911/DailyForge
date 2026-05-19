import { motion } from "framer-motion";

export default function InsightCard({ insights }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card glass-panel flex flex-col h-full"
    >
      <h2 className="text-xl font-bold text-main font-heading tracking-tight mb-5">AI Insights</h2>
      <ul className="space-y-4 flex-1">
        {insights?.map((insight, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-500/5 border border-soft hover:border-primary/30 transition-all duration-300 group">
            <span className="text-primary bg-primary/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">{insight.icon}</span>
            <span className="text-sm font-medium text-main leading-relaxed mt-1">{insight.message}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
