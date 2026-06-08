import TaskItem from "./TaskItem";

const Column = ({ title, columnTasks, status, onToggleComplete, onDelete, onEdit, onUpdate, selectedIds, onSelect }) => (
  <div className="flex flex-col bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 min-h-[500px]">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-main">{title}</h3>
      <span className="bg-gray-200 dark:bg-slate-700 text-xs px-2 py-1 rounded-full text-muted">
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
        />
      ))}
      {columnTasks.length === 0 && (
        <div className="text-center text-sm text-muted py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
          No tasks {status.toLowerCase()}
        </div>
      )}
    </div>
  </div>
);

export default function KanbanBoard({
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
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in w-full">
      <Column title="Due" columnTasks={dueTasks} status="Due" {...columnProps} />
      <Column title="In Progress" columnTasks={inProgressTasks} status="In Progress" {...columnProps} />
      <Column title="Completed" columnTasks={completedTasks} status="Completed" {...columnProps} />
    </div>
  );
}
