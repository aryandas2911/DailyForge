import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import useTasks from "../../hooks/useTasks.js";
import EmptyState from "../EmptyState";

const priorityConfig = {
  High:   { color: "#ef4444" },
  Medium: { color: "#f59e0b" },
  Low:    { color: "#10b981" },
};

/* ---------------- Draggable Task Item ---------------- */
function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task._id,
      data: { task },
    });

  const config = priorityConfig[task.priority] || priorityConfig.Low;

  const style = {
    transform: isDragging
      ? undefined
      : transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    opacity: isDragging ? 0 : 1,
    position: "relative",
    zIndex: isDragging ? 99999 : 1,
    background: `linear-gradient(to right, rgba(${
      task.priority === "High" ? "239,68,68" :
      task.priority === "Medium" ? "245,158,11" :
      "16,185,129"
    }, 0.12), transparent)`,
    backgroundColor: "var(--color-surface)",
    borderLeft: `3px solid ${config.color}`,
    border: `1px solid var(--color-border)`,
    borderLeft: `3px solid ${config.color}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-3 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover-lift"
      role="button"
      tabIndex={0}
      aria-label={`${task.title} - Drag to schedule or use arrow keys`}
    >
      {/* Color dot */}
      <span
        className="h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      />

      {/* Title */}
      <p
        className="flex-1 text-sm font-medium truncate"
        style={{ color: "var(--color-text-main)" }}
      >
        {task.title}
      </p>

      {/* Priority badge */}
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
        style={{
          backgroundColor: `rgba(${
            task.priority === "High" ? "239,68,68" :
            task.priority === "Medium" ? "245,158,11" :
            "16,185,129"
          }, 0.15)`,
          color: config.color,
        }}
      >
        {task.priority}
      </span>
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
    <div
      className="h-full flex flex-col rounded-2xl border border-border p-6 shadow-sm animate-in"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-main)" }}
          >
            Task Library
          </h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-muted)",
            }}
          >
            {filteredTasks?.length ?? 0}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          Drag tasks into your week
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-border"
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text-main)",
        }}
      />

      {/* Task List */}
      <div className="flex-1 space-y-3 pr-1 overflow-y-auto">
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
        className="btn btn-primary w-full mt-4 cursor-pointer hover-lift"
        onClick={onAddTask}
      >
        + Add Task
      </button>
    </div>
  );
}