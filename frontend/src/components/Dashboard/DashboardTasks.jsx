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
    Low: "border-green-400",
    Medium: "border-yellow-400",
    High: "border-red-500",
  };

  const priorityBadge = {
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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
    <div className="card w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold text-main">Today’s Focus</h2>
          <p className="text-xs text-muted">Top priorities for today</p>
        </div>

        <button
          className="mt-3 group flex gap-2 self-center px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
          onClick={() => navigate("/tasks")}
        >
          Manage <ArrowRight className="transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      </div>

      {todayTasks?.length ? (
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div
              key={task._id}
              className={`group relative flex items-center gap-4 border-l-4 rounded-xl p-4 transition-all duration-200
              ${priorityBorder[task.priority]}
              bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 shadow-sm hover:shadow-md`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                className="h-4 w-4 accent-(--primary) cursor-pointer"
                checked={task.status === "Completed"}
                onChange={() => handleCheckboxChange(task)}
              />

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors break-words ${
                    task.status === "Completed"
                      ? "line-through text-muted dark:text-gray-300"
                      : "text-main dark:text-white"
                  }`}
                >
                  {task.title}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      priorityBadge[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>

                  {task.status === "Completed" && (
                    <span className="text-[11px] text-muted dark:text-gray-300">Completed</span>
                  )}
                </div>
              </div>

              {/* Hover affordance */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted dark:text-gray-300 opacity-0 group-hover:opacity-100 transition">
                ✓
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted dark:text-gray-300 text-center py-6 flex flex-col">
          No tasks for today.

          <button
            className="mt-3 self-center px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
            onClick={() => navigate("/tasks")}
          >
            + Add your first task
          </button>
        </div>
      )}

      {durationModalTask && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-2 text-black/90">
              Complete Task
            </h2>

            <p className="text-sm mb-4 text-black">
              How long did you actually take to complete "
              {durationModalTask.title}"?
            </p>
            <input
              type="number"
              min="1"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              className="w-full p-2 border border-soft rounded-lg text-black"
              placeholder="Actual duration in minutes"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setDurationModalTask(null);
                  setActualDuration("");
                }}
                className="px-4 py-2 rounded-lg border border-soft text-black hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleActualDurationSubmit}
                className="btn btn-primary px-4 py-2"
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
