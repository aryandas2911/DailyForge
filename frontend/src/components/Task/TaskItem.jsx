import { Check, Trash2, Pencil, Calendar, Play } from "lucide-react";
import { useState } from "react";
import TaskFormModal from "./TaskFormModal";
import { getCategoryColor } from "../../utils/categoryUtils";
import { RefreshCw } from "lucide-react";

const priorityStyles = {
  Low: "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10",
  Medium: "border-amber-500 bg-amber-50/30 dark:bg-amber-950/10",
  High: "border-rose-500 bg-rose-50/30 dark:bg-rose-950/10",
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
        className={`animate-in w-full rounded-2xl border-l-4 border-y border-r border-slate-200/60 dark:border-slate-800/80 shadow-xs transition duration-200 bg-white dark:bg-slate-900 ${
          priorityStyles[task.priority]
        } ${isCompleted ? "opacity-60" : ""}`}
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

              <div className="min-w-0">
                <p
                  className={`text-base font-semibold break-words tracking-tight ${
                    isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {task.title}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="uppercase tracking-wider text-[10px] font-bold">
                    {task.priority}
                  </span>

                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}

                  {isCompleted && task.actualDuration != null && (
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[11px]">
                      Actual: {task.actualDuration}m
                    </span>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {task.tags.map((tag) => {
                        const categoryColor = getCategoryColor(tag);
                        return (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-bold"
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

                {task.dependsOn && (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                    <span>🔗</span> Depends on: <span className="underline decoration-dotted">{task.dependsOn.title}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 border-t border-slate-100 dark:border-slate-800/40 pt-3 sm:pt-0 sm:border-t-0 shrink-0">
              {task.status === "Due" && (
                <button
                  onClick={() => onUpdate(task._id, { status: "In Progress" })}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 rounded-xl border border-sky-100 dark:border-sky-900/30 hover:bg-sky-100 transition cursor-pointer"
                  title="Start Task"
                >
                  <Play size={12} className="fill-current" />
                  <span>Start</span>
                </button>
              )}
              {task.status === "In Progress" && (
                <button
                  onClick={() => onToggleComplete(task)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 transition cursor-pointer"
                  title="Complete Task"
                >
                  <Check size={12} strokeWidth={2.5} />
                  <span>Complete</span>
                </button>
              )}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
              >
                <Trash2 size={16} />
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