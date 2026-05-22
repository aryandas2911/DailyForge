import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const priorityConfig = {
  Low:    { borderColor: "#22c55e", tint: "rgba(34,197,94,0.10)",  badgeBg: "rgba(34,197,94,0.15)",  badgeColor: "#16a34a" },
  Medium: { borderColor: "#eab308", tint: "rgba(234,179,8,0.10)",  badgeBg: "rgba(234,179,8,0.15)",  badgeColor: "#a16207" },
  High:   { borderColor: "#ef4444", tint: "rgba(239,68,68,0.10)",  badgeBg: "rgba(239,68,68,0.15)",  badgeColor: "#dc2626" },
};

const priorityOrder = { High: 3, Medium: 2, Low: 1 };

export default function DashboardTasks({ tasks, updateTask }) {
  const navigate = useNavigate();
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
    <div className="card w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-main)" }}>
            Today's Focus
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Top priorities for today
          </p>
        </div>

        <button
          className="group flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
          style={{ backgroundColor: "var(--primary)" }}
          onClick={() => navigate("/tasks")}
        >
          Manage
          <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      </div>

      {todayTasks?.length ? (
        <div className="space-y-3">
          {todayTasks.map((task) => {
            const config = priorityConfig[task.priority] || priorityConfig.Low;
            const isCompleted = task.status === "Completed";

            return (
              <div
                key={task._id}
                className="group relative flex items-center gap-4 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  background: `linear-gradient(to right, ${config.tint}, transparent)`,
                  backgroundColor: "var(--bg)",
                  border: `1px solid var(--border)`,
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

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isCompleted ? "var(--text-muted)" : "var(--text-main)",
                      textDecoration: isCompleted ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: config.badgeBg,
                        color: config.badgeColor,
                      }}
                    >
                      {task.priority}
                    </span>

                    {isCompleted && (
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover affordance */}
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-0 group-hover:opacity-100 transition"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✓
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-center py-6 flex flex-col" style={{ color: "var(--text-muted)" }}>
          No tasks for today.
          <button
            className="mt-3 self-center px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: "var(--primary)" }}
            onClick={() => navigate("/tasks")}
          >
            + Add your first task
          </button>
        </div>
      )}
    </div>
  );
}