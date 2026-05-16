import { Check, Trash2, Pencil, Calendar } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const priorityStyles = {
  Low: "border-green-400 bg-white",
  Medium: "border-yellow-400 bg-white",
  High: "border-red-400 bg-white",
};

const priorityBadges = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
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
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
        className={`
          w-full rounded-xl border-l-4
          ${priorityStyles[task.priority]}
          ${isCompleted ? "opacity-60 bg-gray-50" : ""}
          shadow-sm transition-colors duration-200
        `}
      >
        <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task._id)}
            className="w-4 h-4 cursor-pointer accent-[var(--primary)] rounded text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task)}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center
              border shrink-0 cursor-pointer shadow-sm
              transition-all duration-200 ease-in-out
              ${isCompleted ? "bg-[var(--primary)] border-[var(--primary)] text-white scale-110" : "bg-white border-gray-300 hover:border-[var(--primary)]"}
            `}
          >
            {isCompleted && <Check size={14} strokeWidth={3} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-base sm:text-lg font-semibold truncate transition-colors ${
                isCompleted ? "line-through text-gray-400" : "text-main"
              }`}
            >
              {task.title}
            </p>

            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wide text-[10px] ${priorityBadges[task.priority]}`}>
                {task.priority}
              </span>

              {task.dueDate && (
                <span className="flex items-center gap-1 text-gray-500 font-medium">
                  <Calendar size={12} className="text-gray-400" />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-gray-400"
              title="Edit Task"
            >
              <Pencil size={16} />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(task._id)}
              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-gray-400"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>

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

