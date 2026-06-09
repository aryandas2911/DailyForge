import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { SearchX } from "lucide-react";
import EmptyState from "../EmptyState";

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
      className="group flex items-center gap-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60
bg-slate-50/60 dark:bg-slate-800/60 p-3
cursor-grab active:cursor-grabbing
hover:bg-white dark:hover:bg-slate-700
hover:shadow-md transition duration-200 hover-lift"
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
      <p className="flex-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
        {task.title}
      </p>
    </div>
  );
}

/* ---------------- Empty Search Result ---------------- */
function SearchEmptyState({ query, onClearSearch }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-soft bg-white/70 px-4 py-8 text-center">
      <SearchX size={36} className="mb-3 text-muted" aria-hidden="true" />
      <h3 className="text-sm font-semibold text-main">No matching tasks</h3>
      <p className="mt-1 max-w-56 text-xs leading-5 text-muted">
        No tasks match &quot;{query}&quot;. Try a different search term.
      </p>
      <button
        type="button"
        className="btn btn-muted mt-4 text-sm"
        onClick={onClearSearch}
      >
        Clear search
      </button>
    </div>
  );
}

/* ---------------- Task Library ---------------- */
export default function TaskLibrary({ tasks, onAddTask }) {
  
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(normalizedQuery)
  );
  const hasTasks = Boolean(tasks?.length);
  const hasSearchQuery = normalizedQuery.length > 0;

  return (
    <div className="card h-full flex flex-col animate-in">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-main">
            Task Library
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#d0f6e3] dark:bg-cyan-950/50 text-[#3b8ea0] dark:text-cyan-400">
            {filteredTasks?.length ?? 0}
          </span>
        </div>
        <p className="text-xs text-muted">Drag tasks into your week</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 rounded-xl border border-soft/80 px-3 py-2 text-sm bg-transparent text-main placeholder:text-muted dark:bg-slate-800 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]"
      />

      {/* Task List */}
      <div className="flex-1 space-y-3 pr-1 overflow-y-auto max-h-[350px] md:max-h-[500px]">
        {filteredTasks?.length ? (
          filteredTasks.map((task) => (
            <DraggableTask key={task._id} task={task} />
          ))
        ) : hasTasks && hasSearchQuery ? (
          <SearchEmptyState
            query={query.trim()}
            onClearSearch={() => setQuery("")}
          />
        ) : (
          <EmptyState type="tasks" onAction={onAddTask} />
        )}
      </div>

      {/* Footer CTA */}
      <button className="btn btn-primary w-full mt-4 cursor-pointer hover-lift shadow-sm" onClick={onAddTask}>
        + Add Task
      </button>
    </div>
  );
}
