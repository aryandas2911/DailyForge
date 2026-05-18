import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import useTasks from "../../hooks/useTasks.js";
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

  const priorityColors = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
  };

  const style = {
    transform: isDragging
      ? undefined
      : transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    opacity: isDragging ? 0 : 1,
    position: "relative",
    zIndex: isDragging ? 99999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-3 rounded-xl border-soft bg-white/80 dark:bg-slate-800/80 p-3
                 cursor-grab active:cursor-grabbing
                 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all hover-lift"
      role="button"
      tabIndex={0}
      aria-label={`${task.title} - Drag to schedule or use arrow keys`}
    >
      {/* Color dot */}
      <span
        className={`h-3 w-3 rounded-full shrink-0 ${priorityColors[task.priority]}`}
      />

      {/* Title */}
      <p className="flex-1 text-sm font-medium text-main truncate">
        {task.title}
      </p>
    </div>
  );
}

/* ---------------- Task Library ---------------- */
export default function TaskLibrary({ onAddTask }) {
  const { tasks } = useTasks();

  const [query, setQuery] = useState("");

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="card card-muted h-full flex flex-col animate-in">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold text-main">Task Library</h2>

          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-soft text-main">
            {filteredTasks?.length ?? 0}
          </span>
        </div>

        <p className="text-xs text-muted mt-1">
          Drag tasks into your week
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 rounded-xl border-soft px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-(--primary)
                   transition-colors bg-transparent text-main placeholder:text-muted"
        aria-label="Search tasks"
      />

      {/* Task List */}
      <div className="flex-1 space-y-3 pr-1">
        {filteredTasks?.length ? (
          filteredTasks.map((task) => (
            <DraggableTask key={task._id} task={task} />
          ))
        ) : (
          <EmptyState type="tasks" onAction={onAddTask} />
        )}
      </div>

      {/* Footer CTA */}
      <button
        className="btn btn-primary w-full mt-4 cursor-pointer hover-lift transition-all"
        onClick={onAddTask}
      >
        + Add Task
      </button>
    </div>
  );
}