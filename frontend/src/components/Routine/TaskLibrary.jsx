import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { SearchX } from "lucide-react";
import EmptyState from "../EmptyState";

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

  const priorityColor = {
    High: "bg-rose-500",
    Medium: "bg-amber-500",
    Low: "bg-emerald-500",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition duration-200"
      role="button"
      tabIndex={0}
      aria-label={`${task.title} - Drag to schedule or use arrow keys`}
    >
      <span className={`h-3 w-3 rounded-full shadow-xs shrink-0 ${priorityColor[task.priority] || "bg-slate-400"}`} />
      <p className="flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
        {task.title}
      </p>
    </div>
  );
}

function SearchEmptyState({ query, onClearSearch }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 px-4 py-8 text-center">
      <SearchX size={36} className="mb-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching tasks</h3>
      <p className="mt-1 max-w-56 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        No tasks match &quot;{query}&quot;. Try a different search term.
      </p>
      <button
        type="button"
        className="mt-4 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer"
        onClick={onClearSearch}
      >
        Clear search
      </button>
    </div>
  );
}

export default function TaskLibrary({ tasks, onAddTask }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(normalizedQuery)
  );
  const hasTasks = Boolean(tasks?.length);
  const hasSearchQuery = normalizedQuery.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col transition-colors duration-300 w-full box-border">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Task Library
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#3b8ea0] dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {filteredTasks?.length ?? 0}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drag tasks into your week</p>
      </div>

      <input
        type="text"
        placeholder="Search tasks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />

      {/* Task List */}
      <div className="flex-1 space-y-3 pr-1 overflow-y-auto max-h-[350px] md:max-h-[500px]">
        {tasks?.length === 0 ? (
          <EmptyState type="tasks" onAction={onAddTask} />
        ) : filteredTasks?.length > 0 ? (
          filteredTasks.map((task) => (
            <DraggableTask key={task._id} task={task} />
          ))
        ) : hasTasks && hasSearchQuery ? (
          <SearchEmptyState
            query={query.trim()}
            onClearSearch={() => setQuery("")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center px-4">
            <p className="text-sm font-medium text-slate-400 mb-1">No tasks found</p>
            <p className="text-xs text-slate-500">We couldn't find anything matching "{query}"</p>
          </div>
        )}
      </div>

      <button
        className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors mt-4 cursor-pointer"
        onClick={onAddTask}
      >
        + Add Task
      </button>
    </div>
  );
}