import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskPreview({ tasks, updateTask }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => { setNow(new Date()); }, 1000);
    return () => clearInterval(interval);
  }, []);

  const priorityBorder = { Low: "border-teal-400", Medium: "border-sky-400", High: "border-red-400" };
  const priorityBadge = {
    Low: "bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300",
    Medium: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300",
    High: "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-300",
  };

  return (
    <div className="card glass-panel w-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-main font-heading tracking-tight">Upcoming Tasks</h2>
      </div>

      <div className="flex-1">
        {tasks?.length ? (
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map((task, index) => {
                const remainingTime = new Date(task.dueDate) - now;
                const hours = Math.floor(remainingTime / (1000 * 60 * 60));
                const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                const isOverdue = remainingTime <= 0;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={task._id}
                    className={`flex items-center gap-4 border-l-4 rounded-xl p-4 transition-all duration-300
                    ${priorityBorder[task.priority]}
                    glass hover:shadow-lg hover:border-primary/50 group`}
                  >
                    <div className="relative flex items-center justify-center w-5 h-5 rounded-md border border-muted/50 group-hover:border-primary transition-colors cursor-pointer overflow-hidden shrink-0">
                      <input
                        type="checkbox"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        checked={task.status === "Completed"}
                        onChange={() =>
                          updateTask(task._id, {
                            status: task.status === "Completed" ? "Due" : "Completed",
                          })
                        }
                      />
                      {task.status === "Completed" && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 bg-primary rounded-sm" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate transition-colors ${
                        task.status === "Completed" ? "line-through text-muted/50" : "text-main"
                      }`}>
                        {task.title}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${priorityBadge[task.priority]}`}>
                          {task.priority}
                        </span>

                        {task.dueDate && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 bg-slate-500/10 px-2 py-0.5 rounded-md">
                            <Clock size={10} />
                            {new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        )}

                        {task.dueDate && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            {isOverdue ? "Overdue" : `${hours}h ${minutes}m left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-6 glass rounded-xl border-dashed">
            <p className="text-sm font-medium text-muted">No upcoming tasks.</p>
          </motion.div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-soft/50">
        <button
          onClick={() => navigate("/tasks")}
          className="w-full group flex items-center justify-center gap-2 btn bg-transparent border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300"
        >
          View All Tasks <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
