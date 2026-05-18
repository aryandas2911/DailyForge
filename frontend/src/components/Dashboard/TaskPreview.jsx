import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskPreview({ tasks, updateTask }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const priorityConfig = {
    Low:    { borderColor: "#22c55e", tint: "rgba(34,197,94,0.20)",  badgeBg: "rgba(34,197,94,0.15)",  badgeColor: "#22c55e" },
    Medium: { borderColor: "#eab308", tint: "rgba(234,179,8,0.20)",  badgeBg: "rgba(234,179,8,0.15)",  badgeColor: "#eab308" },
    High:   { borderColor: "#ef4444", tint: "rgba(239,68,68,0.20)",  badgeBg: "rgba(239,68,68,0.15)",  badgeColor: "#ef4444" },
  };

  // Sort by due date — nearest first (fixes the ordering issue)
  const sortedTasks = tasks
  ?.filter(task => task.status !== "Completed")
  .filter(task => task.dueDate && new Date(task.dueDate) > now)  // exclude overdue
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  .slice(0, 2);

  return (
    <div
      className="w-full rounded-2xl border border-border p-6 shadow-sm"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-main)" }}
      >
        Upcoming Tasks
      </h2>

      {sortedTasks?.length ? (
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const config = priorityConfig[task.priority] || priorityConfig.Low;
            const isCompleted = task.status === "Completed";
            const remainingTime = new Date(task.dueDate) - now;
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            return (
              <div
                key={task._id}
                className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  background: `linear-gradient(to right, ${config.tint}, transparent)`,
                  backgroundColor: "var(--color-surface)",
                  border: `1px solid var(--color-border)`,
                  borderLeft: `4px solid ${config.borderColor}`,
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-blue-500 shrink-0"
                  checked={isCompleted}
                  onChange={() =>
                    updateTask(task._id, {
                      status: isCompleted ? "Due" : "Completed",
                    })
                  }
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isCompleted ? "var(--color-text-muted)" : "var(--color-text-main)",
                      textDecoration: isCompleted ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: config.badgeBg,
                        color: config.badgeColor,
                      }}
                    >
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                    )}

                    {task.dueDate && (
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: remainingTime > 0 ? "#ef4444" : "#94a3b8" }}
                      >
                        {remainingTime > 0
                          ? `${hours}h ${minutes}m ${seconds}s left`
                          : "Overdue"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p
          className="text-sm text-center py-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          No upcoming tasks.
        </p>
      )}

      <div className="mt-4 text-sm">
        <button
          onClick={() => navigate("/tasks")}
          className="hover:underline cursor-pointer transition-colors"
          style={{ color: "var(--color-primary)" }}
        >
          View All Tasks →
        </button>
      </div>
    </div>
  );
}