import { Check, Trash2, Pencil, Calendar } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
import { getCategoryColor } from "../../utils/categoryUtils";

const priorityConfig = {
    Low:    { borderColor: "#22c55e", tint: "rgba(34,197,94,0.20)",  badgeBg: "rgba(34,197,94,0.15)",  badgeColor: "#22c55e" },
    Medium: { borderColor: "#eab308", tint: "rgba(234,179,8,0.20)",  badgeBg: "rgba(234,179,8,0.15)",  badgeColor: "#eab308" },
    High:   { borderColor: "#ef4444", tint: "rgba(239,68,68,0.20)",  badgeBg: "rgba(239,68,68,0.15)",  badgeColor: "#ef4444" },
  };

export default function TaskItem({ task, onToggleComplete, onDelete, onUpdate, isSelected, onSelect }) {
  const isCompleted = task.status === "Completed";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const priority = priorityConfig[task.priority] || priorityConfig.Low;

  const handleEditSubmit = (updatedTask) => {
    onUpdate(task._id, updatedTask);
    setIsEditModalOpen(false);
  };
  

  return (
    <>
      <div
        className={`animate-in hover-lift w-full rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${isCompleted ? "opacity-60" : ""}`}
       style={{
                  background: `linear-gradient(to right, ${priority.tint}, transparent)`,
                  backgroundColor: "var(--color-surface)",
                  border: `1px solid var(--color-border)`,
                  borderLeft: `4px solid ${priority.borderColor}`,
                  opacity: isCompleted ? 0.6 : 1,
                }}
      >
        <div className="flex items-center gap-4 px-5 py-4">

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
            className="w-8 h-8 rounded-md flex items-center justify-center border-2 shrink-0 cursor-pointer transition-all duration-150 hover:scale-105"
            style={{
              backgroundColor: isCompleted ? "#6366f1" : "var(--color-surface)",
              borderColor: isCompleted ? "#6366f1" : "var(--color-border)",
              color: "white",
            }}
          >
            {isCompleted && <Check size={16} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="text-base font-semibold truncate"
              style={{
                color: isCompleted ? "var(--color-text-muted)" : "var(--color-text-main)",
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {task.title}
            </p>

            <div
              className="flex items-center gap-3 mt-1.5 text-xs flex-wrap"
              style={{ color: "var(--color-text-muted)" }}
            >
              <span className="uppercase tracking-widest font-medium">
                {task.priority} Priority
              </span>

              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <span>·</span>
                  <Calendar size={11} />
                  {new Date(task.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {task.tags.map((tag) => {
                    const categoryColor = getCategoryColor(tag);
                    return (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
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
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-surface)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              aria-label="Edit task"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() => onDelete(task._id)}
              className="p-2 rounded-lg transition-all duration-150 cursor-pointer text-red-500"
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Delete task"
            >
              <Trash2 size={16} />
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