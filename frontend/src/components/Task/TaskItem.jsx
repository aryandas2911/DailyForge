import { Check, Trash2, Pencil, Calendar } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
import { getCategoryColor } from "../../utils/categoryUtils";

const priorityStyles = {
  Low: "border-green-500 bg-green-50",
  Medium: "border-yellow-500 bg-yellow-50",
  High: "border-red-500 bg-red-50",
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
          shadow-sm hover:shadow-md transition
        `}
      >
        <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(task._id)}
              className="w-4 h-4 cursor-pointer accent-blue-500 mt-1 sm:mt-0 shrink-0"
            />
            {/* Toggle Complete */}
            <button
              onClick={() => onToggleComplete(task)}
              className={`
                w-8 h-8 rounded-md flex items-center justify-center
                border-soft shrink-0 cursor-pointer
                transition-transform duration-150
                ${isCompleted ? "bg-(--primary) text-white" : "bg-white border hover:bg-gray-50"}
              `}
            >
              {isCompleted && <Check size={18} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-base sm:text-lg font-semibold truncate ${
                  isCompleted ? "line-through text-muted" : "text-main"
                }`}
              >
                {task.title}
              </p>

              <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs text-muted flex-wrap">
                <span className="uppercase tracking-wide font-medium">{task.priority} priority</span>

                {task.dueDate && (
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}

                {/* Category Badges */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {task.tags.map((tag) => {
                      const categoryColor = getCategoryColor(tag);
                      return (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide shadow-xs"
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0 pl-11 sm:pl-0">
            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer shadow-none hover:shadow-sm"
            >
              <Pencil size={18} className="text-blue-600 sm:text-main" />
            </button>

            {/* Delete Button */}
            <button
              onClick={()=> onDelete(task._id)}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shadow-none hover:shadow-sm"
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
