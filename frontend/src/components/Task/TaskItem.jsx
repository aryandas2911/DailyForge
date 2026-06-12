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
                  className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 dark:text-slate-100 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 accent-(--primary)"
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
        className={`animate-in w-full rounded-2xl border-l-4 border-y border-r border-slate-200/60 dark:border-slate-800/80 shadow-xs transition duration-200 bg-white dark:bg-slate-900 ${
          priorityStyles[task.priority]
        } ${isCompleted ? "opacity-60" : ""}`}
      >
        {viewmode === "board" ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(task._id)}
                  className="w-4 h-4 mt-1 cursor-pointer rounded border-slate-300 dark:border-slate-700 text-[#3b8ea0] focus:ring-[#3b8ea0] accent-[#3b8ea0]"
                />
                <div className="min-w-0">
                  <p
                    className={`text-base font-semibold break-words tracking-tight ${
                      isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.dependsOn && (
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <span>🔗</span> Depends on: <span className="underline decoration-dotted">{task.dependsOn.title}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
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
                <div className="flex gap-1 flex-wrap ml-auto">
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

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-1">
              <button
                onClick={() => onToggleComplete(task)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 cursor-pointer transition ${
                  isCompleted
                    ? "bg-[#3b8ea0] border-[#3b8ea0] text-white"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {isCompleted && <Check size={16} strokeWidth={3} />}
              </button>

              <div className="flex items-center gap-1">
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
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(task._id)}
                className="w-4 h-4 mt-1 cursor-pointer rounded border-slate-300 dark:border-slate-700 text-[#3b8ea0] focus:ring-[#3b8ea0] accent-[#3b8ea0]"
              />
              <button
                onClick={() => onToggleComplete(task)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 cursor-pointer transition mt-0.5 ${
                  isCompleted
                    ? "bg-[#3b8ea0] border-[#3b8ea0] text-white"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {isCompleted && <Check size={16} strokeWidth={3} />}
              </button>

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

      {isEditModalOpen && (
        <TaskFormModal
          task={task}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          errorMessage=""
          onError={() => {}}
        />
      )}
    </>
  );
}