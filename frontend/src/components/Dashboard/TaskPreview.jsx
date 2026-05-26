import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";


export default function TaskPreview({ tasks , updateTask}) {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="card w-full">
      <h2 className="text-lg font-semibold text-main mb-4">Upcoming Tasks</h2>

      {tasks?.length ? (
        <div className="space-y-3">
          {tasks.map((task) => {

              const remainingTime = new Date(task.dueDate) - now;
              const isOverdue = remainingTime <= 0;

              const hours = isOverdue ? 0 : Math.floor(
                remainingTime / (1000 * 60 * 60)
              );

              const minutes = isOverdue ? 0 : Math.floor(
                (remainingTime % (1000 * 60 * 60)) /
                  (1000 * 60)
              );

              const seconds = isOverdue ? 0 : Math.floor(
                (remainingTime % (1000 * 60)) / 1000
              );

            return (
            <div
              key={task._id}
              className={`flex items-center gap-4 border-l-4 rounded-xl p-4 transition
              ${priorityBorder[task.priority]}
              bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 shadow-sm`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                className="h-4 w-4 accent-(--primary) cursor-pointer"
                checked={task.status === "Completed"}
                onChange={() =>
                  updateTask(task._id, {
                    status: task.status === "Completed" ? "Due" : "Completed",
                  })
                }
              />

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    task.status === "Completed"
                      ? "line-through decoration-2 decoration-muted text-muted"
                      : "text-main"
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

                  {task.dueDate && (
                    <span className="text-[11px] text-muted">
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  )}

                  {/*Disply Remaining Time */}
                  {task.dueDate && (
                    <span className="text-[11px] text-red-500 font-medium">
                      {isOverdue 
                        ? "Overdue"
                        : `${hours}h ${minutes}m ${seconds}s left`}
                    </span>
                  )}

                </div>
              </div>
            </div>
         ) })}
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-6">
          No upcoming tasks.
        </p>
      )}

      <div className="mt-4 text-sm text-primary">
        <button
          onClick={() => navigate("/tasks")}
          className="group mt-3 flex gap-2 self-center px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          View All Tasks <ArrowRight className="transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
