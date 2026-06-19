import TaskItem from "./TaskItem";

const Column = ({ title, columnTasks, status, onToggleComplete, onDelete, onEdit, onUpdate, selectedIds, onSelect, viewMode }) => (
  <div className="flex flex-col bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 min-h-[500px]">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide">{title}</h3>
      <span className="bg-slate-200/60 dark:bg-slate-800 text-xs px-2.5 py-0.5 rounded-full font-semibold text-slate-600 dark:text-slate-400 border border-slate-300/30 dark:border-slate-700">
        {columnTasks.length}
      </span>
    </div>
    <div className="flex flex-col gap-3">
      {columnTasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdate={onUpdate}
          isSelected={selectedIds.includes(task._id)}
          onSelect={onSelect}
          viewMode={viewMode}
        />
      ))}
      {columnTasks.length === 0 && (
        <div className="text-center text-sm font-medium text-slate-400 dark:text-slate-500 py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/30 dark:bg-slate-900/10">
          No tasks {status.toLowerCase()}
        </div>
      )}
    </div>
  </div>
);

export default function KanbanBoard({
  viewMode,
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onUpdate,
  selectedIds,
  onSelect,
}) {
  const dueTasks = tasks.filter((t) => t.status === "Due");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  const columnProps = {
    onToggleComplete,
    onDelete,
    onEdit,
    onUpdate,
    selectedIds,
    onSelect,
    viewMode
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in w-full box-border">
      <Column title="Due" columnTasks={dueTasks} status="Due" {...columnProps} />
      <Column title="In Progress" columnTasks={inProgressTasks} status="In Progress" {...columnProps} />
      <Column title="Completed" columnTasks={completedTasks} status="Completed" {...columnProps} />
    </div>
  );
}