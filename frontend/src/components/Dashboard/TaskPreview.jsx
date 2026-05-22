import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const priorityConfig = {
  Low:    { borderColor: "#22c55e", tint: "rgba(34,197,94,0.10)",  badgeBg: "rgba(34,197,94,0.15)",  badgeColor: "#16a34a" },
  Medium: { borderColor: "#eab308", tint: "rgba(234,179,8,0.10)",  badgeBg: "rgba(234,179,8,0.15)",  badgeColor: "#a16207" },
  High:   { borderColor: "#ef4444", tint: "rgba(239,68,68,0.10)",  badgeBg: "rgba(239,68,68,0.15)",  badgeColor: "#dc2626" },
};

export default function TaskPreview({ tasks, updateTask }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card w-full">
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-main)" }}>
        Upcoming Tasks
      </h2>

      {tasks?.length ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const config = priorityConfig[task.priority] || priorityConfig.Low;
            const isCompleted = task.status === "Completed";
            const remainingTime = new Date(task.dueDate) - now;
            const isOverdue = remainingTime <= 0;
            const hours = isOverdue ? 0 : Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = isOverdue ? 0 : Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = isOverdue ? 0 : Math.floor((remainingTime % (1000 * 60)) / 1000);

            return (
              <div
                key={task._id}
                className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
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

                {/* Content */}
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
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    )}

                    {task.dueDate && (
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: isOverdue ? "#ef4444" : "var(--text-muted)" }}
                      >
                        {isOverdue ? "Overdue" : `${hours}h ${minutes}m ${seconds}s left`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
          No upcoming tasks.
        </p>
      )}

      <div className="mt-4">
        <button
          onClick={() => navigate("/tasks")}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
          style={{ backgroundColor: "var(--primary)" }}
        >
          View All Tasks
          <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}