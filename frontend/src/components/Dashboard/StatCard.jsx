import { motion } from "framer-motion";

export default function StatCard({ label, value, subtitle, icon }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="card glass-panel group flex items-start gap-5 relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
      
      <div className="text-primary bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      <div className="relative z-10">
        <p className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-3xl font-bold text-main font-heading tracking-tight mt-1">{value}</p>
        {subtitle && <p className="text-xs text-muted mt-1 font-medium">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
