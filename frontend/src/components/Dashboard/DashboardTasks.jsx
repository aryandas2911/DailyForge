import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function DashboardTasks({ tasks, updateTask }) {
  const navigate = useNavigate();
  const [durationModalTask, setDurationModalTask] = useState(null);
  const [actualDuration, setActualDuration] = useState("");

  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const priorityBorder = {
    Low: "border-emerald-400 dark:border-emerald-500",
    Medium: "border-amber-400 dark:border-amber-500",
    High: "border-rose-500",
  };

  const priorityBadge = {
    Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    High: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
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

  const handleCheckboxChange = async (task) => {
    try {
      if (task.status === "Completed") {
        await updateTask(task._id, {
          status: "Due",
          actualDuration: null,
        });
      } else {
        setDurationModalTask(task);
        setActualDuration("");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleActualDurationSubmit = async () => {
    const durationValue = Number(actualDuration);

    if (Number.isNaN(durationValue) || durationValue <= 0) {
      alert("Please enter a valid duration in minutes");
      return;
    }

    try {
      await updateTask(durationModalTask._id, {
        status: "Completed",
        actualDuration: durationValue,
      });

      setDurationModalTask(null);
      setActualDuration("");
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 w-full">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today’s Focus</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Top priorities for today</p>
        </div>

        <button
          className="group flex gap-2 items-center px-4 py-2 rounded-lg bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-medium active:scale-95 transition-all duration-150 cursor-pointer"
          onClick={() => navigate("/tasks")}
        >
          Manage <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      </div>

      {todayTasks?.length ? (
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div
              key={task._id}
              className={`group relative flex items-center gap-4 border-l-4 rounded-xl p-4 transition-all duration-200
              ${priorityBorder[task.priority]}
              bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-y border-r border-slate-200/60 dark:border-slate-800 shadow-xs`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#3b8ea0] focus:ring-[#3b8ea0] accent-[#3b8ea0] cursor-pointer"
                checked={task.status === "Completed"}
                onChange={() => handleCheckboxChange(task)}
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors break-words ${
                    task.status === "Completed"
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {task.title}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      priorityBadge[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>

                  {task.status === "Completed" && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Completed</span>
                  )}
                </div>
              </div>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition duration-150">
                ✓
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8 flex flex-col items-center justify-center">
          No tasks for today.

          <button
            className="mt-4 px-4 py-2 rounded-lg bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-medium active:scale-95 transition-all duration-150 cursor-pointer"
            onClick={() => navigate("/tasks")}
          >
            + Add your first task
          </button>
        </div>
      )}

      {durationModalTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200 px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transition-all transform scale-100">
            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
              Complete Task
            </h2>

            <p className="text-sm mb-4 text-slate-500 dark:text-slate-400 leading-relaxed">
              How long did you actually take to complete "
              <span className="font-semibold text-slate-800 dark:text-slate-200">{durationModalTask.title}</span>"?
            </p>
            <input
              type="number"
              min="1"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border"
              placeholder="Actual duration in minutes"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setDurationModalTask(null);
                  setActualDuration("");
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleActualDurationSubmit}
                className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}