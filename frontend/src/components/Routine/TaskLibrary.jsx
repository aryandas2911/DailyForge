import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ClipboardList, Plus, Search, SearchX } from "lucide-react";

/* ---------------- Draggable Task Item ---------------- */
function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task._id,
      data: {
        task,
      },
    });

  const style = {
    transform: isDragging
      ? undefined
      : transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 99999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-3 rounded-xl border border-soft/50 bg-[#f8fafc]/30 dark:bg-slate-800/40 p-3
                 cursor-grab active:cursor-grabbing
                 hover:bg-white dark:hover:bg-slate-850 hover:shadow-md transition duration-200 hover-lift"
      role="button"
      tabIndex={0}
      aria-label={`${task.title} - Drag to schedule or use arrow keys`}
    >
      {/* Color dot */}
      <span
        className="h-3 w-3 rounded-full shadow-sm"
        style={{
          backgroundColor:
            task.priority === "High"
              ? "#ef4444"
              : task.priority === "Medium"
                ? "#f59e0b"
                : "#10b981",
        }}
      />

      {/* Title */}
      <p className="flex-1 text-sm font-medium text-main truncate">
        {task.title}
      </p>
    </div>
  );
}

/* ---------------- Task Library ---------------- */
export default function TaskLibrary({ tasks, onAddTask }) {
  const [query, setQuery] = useState("");

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase())
  );

  const hasNoTasks = !tasks || tasks.length === 0;

  return (
    <div className="card h-full flex flex-col animate-in">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-main">
            Task Library
          </h2>
          {!hasNoTasks && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#d0f6e3] dark:bg-cyan-950/50 text-[#3b8ea0] dark:text-cyan-400 animate-in fade-in">
              {filteredTasks?.length ?? 0}
            </span>
          )}
        </div>
        <p className="text-xs text-muted">Drag tasks into your week</p>
      </div>

      {hasNoTasks ? (
        /* Empty State: Zero Tasks in Database */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-soft rounded-2xl bg-gray-50/50 dark:bg-slate-800/20 my-2 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-3 shadow-sm">
            <ClipboardList size={22} className="animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-main mb-1.5">No Tasks Created</h3>
          <p className="text-xs text-muted leading-relaxed max-w-[200px] mb-4">
            Build your personal task library to schedule your weekly routines easily.
          </p>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all shadow-sm cursor-pointer hover-lift"
          >
            <Plus size={14} /> Create a Task
          </button>
        </div>
      ) : (
        /* Has Tasks: Show Search and List */
        <>
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-soft/80 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4eb7b3] bg-transparent text-main placeholder:text-muted"
            />
            <div className="absolute left-3 top-2.5 text-muted">
              <Search size={16} />
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 space-y-3 pr-1 overflow-y-auto max-h-[350px] md:max-h-[500px]">
            {filteredTasks?.length ? (
              filteredTasks.map((task) => (
                <DraggableTask key={task._id} task={task} />
              ))
            ) : (
              /* No Search Results */
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 border border-soft/50 rounded-xl bg-gray-50/30 dark:bg-slate-800/10 animate-in fade-in duration-200">
                <SearchX size={20} className="text-muted mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-main">No matches found</p>
                <button
                  onClick={() => setQuery("")}
                  className="text-[11px] font-bold text-primary hover:underline mt-1 cursor-pointer"
                >
                  Clear search query
                </button>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <button
            className="btn btn-primary w-full mt-4 cursor-pointer hover-lift shadow-sm"
            onClick={onAddTask}
          >
            + Add Task
          </button>
        </>
      )}
    </div>
  );
}
