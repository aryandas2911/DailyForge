import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useTasks from "../../hooks/useTasks.js";

/* ---------------- Draggable Task Item ---------------- */
function DraggableTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-3 rounded-xl border-soft bg-white/80 p-3
                 cursor-grab active:cursor-grabbing
                 hover:bg-white hover:shadow-md transition-all hover-lift"
    >
      {/* Color dot */}
      <span
        className="h-3 w-3 rounded-full"
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
export default function TaskLibrary({ onAddTask }) {
  const { tasks } = useTasks();
  const [query, setQuery] = useState("");

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="card card-muted h-full flex flex-col animate-in">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-main">Task Library</h2>
        <p className="text-xs text-muted">Drag tasks into your week</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 rounded-xl border-soft px-3 py-2 text-sm focus:outline-none"
      />

      {/* Task List */}
      <div className="flex-1 space-y-3 pr-1">
        {filteredTasks?.length ? (
          <SortableContext
            items={filteredTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredTasks.map((task) => (
              <DraggableTask key={task._id} task={task} />
            ))}
          </SortableContext>
        ) : (
          <div className="text-sm text-muted text-center py-8">
            No tasks found
          </div>
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
