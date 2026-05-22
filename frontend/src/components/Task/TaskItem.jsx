import { Check, Trash2, Pencil, Calendar } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
import { getCategoryColor } from "../../utils/categoryUtils";

const priorityConfig = {
  Low:    { borderColor: "#22c55e", tint: "rgba(34,197,94,0.10)",  badgeBg: "rgba(34,197,94,0.15)",  badgeColor: "#16a34a" },
  Medium: { borderColor: "#eab308", tint: "rgba(234,179,8,0.10)",  badgeBg: "rgba(234,179,8,0.15)",  badgeColor: "#a16207" },
  High:   { borderColor: "#ef4444", tint: "rgba(239,68,68,0.10)",  badgeBg: "rgba(239,68,68,0.15)",  badgeColor: "#dc2626" },
};

export default function TaskItem({ task, onToggleComplete, onDelete, onUpdate, isSelected, onSelect }) {
  const isCompleted = task.status === "Completed";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const config = priorityConfig[task.priority] || priorityConfig.Low;

  const handleEditSubmit = (updatedTask) => {
    onUpdate(task._id, updatedTask);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div
        className={`animate-in hover-lift w-full rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${isCompleted ? "opacity-70" : ""}`}
        style={{
          background: `linear-gradient(to right, ${config.tint}, transparent)`,
          backgroundColor: "var(--bg)",
          border: `1px solid var(--border)`,
          borderLeft: `4px solid ${config.borderColor}`,
        }}
      >
        <div className="flex items-center gap-6 px-6 py-5">

          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task._id)}
            className="w-4 h-4 cursor-pointer accent-blue-500 shrink-0"
          />

          {/* Complete Toggle */}
          <button
            onClick={() => onToggleComplete(task)}
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-all duration-150 hover:scale-105 border"
            style={{
              backgroundColor: isCompleted ? "var(--primary)" : "var(--bg)",
              borderColor: isCompleted ? "var(--primary)" : "var(--border)",
              color: "white",
            }}
          >
            {isCompleted && <Check size={16} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="text-lg font-semibold truncate"
              style={{
                color: isCompleted ? "var(--text-muted)" : "var(--text-main)",
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {task.title}
            </p>

            <div
              className="flex items-center gap-3 mt-2 text-xs flex-wrap"
              style={{ color: "var(--text-muted)" }}
            >
              {/* Priority Badge */}
              <span
                className="px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: config.badgeBg,
                  color: config.badgeColor,
                }}
              >
                {task.priority} priority
              </span>

              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}

              {isCompleted && task.actualDuration != null && (
                <span>Actual: {task.actualDuration}m</span>
              )}

              {/* Category Badges */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {task.tags.map((tag) => {
                    const categoryColor = getCategoryColor(tag);
                    return (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: categoryColor.bgColor,
                          color: categoryColor.color,
                        }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-lg transition-all duration-150 cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              aria-label="Edit task"
            >
              <Pencil size={17} />
            </button>

            <button
              onClick={() => onDelete(task._id)}
              className="p-2 rounded-lg transition-all duration-150 cursor-pointer text-red-500"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              aria-label="Delete task"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <TaskFormModal
          task={task}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}