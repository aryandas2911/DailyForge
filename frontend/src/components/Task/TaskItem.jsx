import { Check, Trash2, Pencil, Calendar, Play } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
import { getCategoryColor } from "../../utils/categoryUtils";
import { RefreshCw } from "lucide-react";

const priorityStyles = {
  Low: "border-green-500 bg-green-50 dark:bg-green-950/20",
  Medium: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  High: "border-red-500 bg-red-50 dark:bg-red-950/20",
};

export default function TaskItem({
  task,
  tasks = [],
  onToggleComplete,
  onDelete,
  onUpdate,
  isSelected,
  onSelect,
  viewMode,
}) {
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
        {viewMode === "board" ? (
          <div className="flex flex-col gap-3.5 p-5">
            {/* Header: Checkbox & Priority & Tags */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(task._id)}
                  className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 accent-(--primary)"
                />
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70 dark:bg-slate-800/70 text-main shadow-xs border border-soft">
                  {task.priority}
                </span>
              </div>
              
              {/* Category Badges */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {task.tags.slice(0, 2).map((tag) => {
                    const categoryColor = getCategoryColor(tag);
                    return (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                        style={{
                          backgroundColor: categoryColor.bgColor,
                          color: categoryColor.color,
                        }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {task.tags.length > 2 && (
                    <span className="text-[10px] text-muted font-bold px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-soft">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title & Dependency */}
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-start gap-2 justify-between">
                <h4
                  className={`text-base font-bold break-words leading-snug tracking-tight ${
                    isCompleted ? "line-through text-muted/60" : "text-main"
                  }`}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  {task.isRecurringInstance && (
                    <RefreshCw size={12} className="text-muted" title="Recurring task instance" />
                  )}
                  {task.recurrence?.enabled && !task.isRecurringInstance && (
                    <RefreshCw size={12} className="text-(--primary)" title="Recurring task" />
                  )}
                </div>
              </div>

              {task.dependsOn && (
                <div className="text-[11px] text-muted flex items-center gap-1 mt-1 bg-white/40 dark:bg-slate-800/40 px-2 py-1 rounded border border-soft/30">
                  <span className="shrink-0 text-amber-500">🔗</span>
                  <span className="truncate" title={task.dependsOn.title}>
                    Depends on: {task.dependsOn.title}
                  </span>
                </div>
              )}
            </div>

            {/* Due Date & Duration */}
            {(task.dueDate || (isCompleted && task.actualDuration != null)) && (
              <div className="flex items-center gap-3 text-xs text-muted/80 flex-wrap w-full border-t border-gray-200/50 dark:border-slate-700/30 pt-3">
                {task.dueDate && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={12} className="opacity-70" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {isCompleted && task.actualDuration != null && (
                  <span className="bg-green-100/60 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    Actual: {task.actualDuration}m
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between w-full mt-1 pt-3 border-t border-gray-200/50 dark:border-slate-700/30">
              <button
                onClick={() => onToggleComplete(task)}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  border border-gray-200 dark:border-slate-700 shrink-0 cursor-pointer
                  transition-all duration-150 hover:scale-105 hover:shadow-xs
                  ${isCompleted ? "bg-(--primary) text-white border-transparent" : "bg-white dark:bg-slate-800 text-main hover:bg-gray-50 dark:hover:bg-slate-700"}
                `}
                title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
              >
                {isCompleted ? <Check size={14} className="stroke-[3]" /> : <Check size={14} className="opacity-0 hover:opacity-100" />}
              </button>

              <div className="flex items-center gap-1.5">
                {task.status === "Due" && (
                  <button
                    onClick={() => onUpdate(task._id, { status: "In Progress" })}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
                    title="Start Task"
                  >
                    <Play size={11} className="fill-current shrink-0" />
                    <span>Start</span>
                  </button>
                )}
                {task.status === "In Progress" && (
                  <button
                    onClick={() => onToggleComplete(task)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Complete Task"
                  >
                    <Check size={11} className="stroke-[3] shrink-0" />
                    <span>Complete</span>
                  </button>
                )}
                
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer text-muted hover:text-main"
                  title="Edit task"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => onDelete(task._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-red-500/80 hover:text-red-600"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
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
              <div className="flex items-center gap-2">
                <p
                  className={`text-lg font-semibold break-words ${
                    isCompleted ? "line-through text-muted" : "text-main"
                  }`}
                >
                  {task.title}
                </p>
                {task.isRecurringInstance && (
                  <RefreshCw size={12} className="text-muted flex-shrink-0" title="Recurring task instance" />
                )}
                {task.recurrence?.enabled && !task.isRecurringInstance && (
                  <RefreshCw size={12} className="text-(--primary) flex-shrink-0" title="Recurring task" />
                )}
              </div>

              {task.dependsOn && (
  <p className="text-xs text-muted mt-1">
    🔗 Depends on: {task.dependsOn.title}
  </p>
)}

              <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap">
                <span className="uppercase tracking-wide">
                  {task.priority} priority
                </span>

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
                  <Play size={14} />{" "}
                  <span className="hidden sm:inline">Start</span>
                </button>
              )}
              {task.status === "In Progress" && (
                <button
                  onClick={() => onToggleComplete(task)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition cursor-pointer"
                  title="Complete Task"
                >
                  <Check size={14} />{" "}
                  <span className="hidden sm:inline">Complete</span>
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
                onClick={() => onDelete(task._id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition cursor-pointer"
              >
                <Trash2 size={18} className="text-red-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <TaskFormModal
          task={task}
          tasks={tasks}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          errorMessage=""
          onError={() => {}}
        />
      )}
    </>
  );
}
