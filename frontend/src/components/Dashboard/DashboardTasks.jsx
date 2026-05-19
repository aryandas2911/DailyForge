import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardTasks({ tasks, updateTask }) {
  const navigate = useNavigate();

  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  const priorityBorder = { Low: "border-teal-400", Medium: "border-sky-400", High: "border-red-400" };
  const priorityBadge = {
    Low: "bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300",
    Medium: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300",
    High: "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-300",
  };

  const today = new Date();
  const todayTasks = tasks
    ?.filter((task) => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return today.toDateString() === due.toDateString();
    })
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 5);

  return (
    <div className="card glass-panel w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-main font-heading tracking-tight">Today's Focus</h2>
          <p className="text-xs font-medium text-muted mt-1 uppercase tracking-wider">Top priorities for today</p>
        </div>
        <button
          className="group flex gap-2 items-center px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-slate-900 text-sm font-medium transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/tasks")}
        >
          Manage <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {todayTasks?.length ? (
        <div className="space-y-3">
          <AnimatePresence>
            {todayTasks.map((task, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={task._id}
                className={`group relative flex items-center gap-4 border-l-4 rounded-xl p-4 transition-all duration-300
                ${priorityBorder[task.priority]}
                glass hover:shadow-lg hover:border-primary/50`}
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

                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold transition-all duration-300 ${
                      task.status === "Completed" ? "line-through text-muted/50" : "text-main"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${priorityBadge[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.status === "Completed" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Completed</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted text-center py-10 flex flex-col items-center justify-center glass rounded-xl border-dashed">
          <p className="font-medium mb-4">No tasks for today. You're all caught up!</p>
          <button className="btn btn-primary shadow-lg shadow-primary/20" onClick={() => navigate("/tasks")}>
            Add your first task
          </button>
        </motion.div>
      )}
    </div>
  );
}
