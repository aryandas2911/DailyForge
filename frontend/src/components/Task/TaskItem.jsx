import { Check, Trash2, Pencil, Calendar, Play } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
import { getCategoryColor } from "../../utils/categoryUtils";

const priorityStyles = {
  Low: "border-green-500 bg-green-50 dark:bg-green-950/20",
  Medium: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  High: "border-red-500 bg-red-50 dark:bg-red-950/20",
};

export default function TaskItem({ task, onToggleComplete, onDelete, onUpdate, isSelected, onSelect }) {
  const isCompleted = task.status === "Completed";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSubmit = (updatedTask) => {
    onUpdate(task._id, updatedTask);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div
        className={`
          animate-in hover-lift
          w-full rounded-xl border-l-4
          ${priorityStyles[task.priority]}
          ${isCompleted ? "opacity-70" : ""}
          shadow-sm hover:shadow-md transition dark:border-gray-700 dark:text-white
        `}
      >
        <div className="flex items-center gap-6 px-6 py-6">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task._id)}
            className="w-4 h-4 cursor-pointer accent-blue-500"
          />
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task)}
            className={`
              w-8 h-8 rounded-md flex items-center justify-center
              border-soft shrink-0 cursor-pointer
              transition-transform duration-150
              ${isCompleted ? "bg-(--primary) text-white" : "bg-white dark:bg-slate-800 dark:text-white"}
            `}
          >
            {isCompleted && <Check size={18} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p

              className={`text-lg font-semibold break-words ${
                isCompleted ? "line-through text-muted" : "text-main"

              }`}
            >
              {task.title}
            </p>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap">
              <span className="uppercase tracking-wide">{task.priority} priority</span>

              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString()}
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
          <div className="flex items-center gap-2">
            {task.status === "Due" && (
              <button
                onClick={() => onUpdate(task._id, { status: "In Progress" })}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition cursor-pointer"
                title="Start Task"
              >
                <Play size={14} /> <span className="hidden sm:inline">Start</span>
              </button>
            )}
            {task.status === "In Progress" && (
              <button
                onClick={() => onToggleComplete(task)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition cursor-pointer"
                title="Complete Task"
              >
                <Check size={14} /> <span className="hidden sm:inline">Complete</span>
              </button>
            )}
            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Pencil size={18} className="text-main" />
            </button>

            {/* Delete Button - Fix : Ensure onDelete uses task._id*/}
            <button
              onClick={()=> onDelete(task._id)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition cursor-pointer"
            >
              <Trash2 size={18} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
