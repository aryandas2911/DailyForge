import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskItem from "../components/Task/TaskItem";
import TaskFormModal from "../components/Task/TaskFormModal";
import TaskCalendar from "../components/Task/TaskCalendar";
import { Plus, ArrowLeft, Trash2, LayoutList, Calendar as CalendarIcon } from "lucide-react";
import EmptyState from "../components/EmptyState";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask , bulkDelete} = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    await bulkDelete(selectedIds);
    setSelectedIds([]);
  };

  /** --- Handlers --- */
  const handleToggle = (task) => {
    updateTask(task._id, {
      status: task.status === "Completed" ? "Due" : "Completed",
    });
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, data);
      } else {
        await addTask({ ...data, status: "Due" });
      }
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save task");
    }
  };

  /** --- Insights --- */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const completionPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const upcomingDeadlines = tasks.filter((task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    const due = new Date(task.dueDate);
    return due >= now && due <= threeDaysFromNow;
  });

  const nextTask = tasks
  .filter((task) => task.dueDate && task.status !== "Completed")
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const highPriorityCount = tasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed"
  ).length;
  const isOverloaded = highPriorityCount >= 3;

  return (
    <>
      <div className="min-h-screen app-bg px-6 lg:px-12 py-8 animate-in">
        <div className="max-w-[1200px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-6 flex-wrap animate-in delay-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-lg p-2 border border-soft text-muted hover:bg-white cursor-pointer transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-main tracking-tight">
                  Tasks
                </h1>
                <p className="text-sm text-muted mt-1">
                  {completedTasks}/{totalTasks} completed · Stay consistent
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-white border border-soft rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-gray-100 text-main shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutList size={16} />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    viewMode === 'calendar' ? 'bg-gray-100 text-main shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarIcon size={16} />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-danger flex items-center gap-2 cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <Trash2 size={18} /> Delete Selected ({selectedIds.length})
                </button>
              )}
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary flex items-center gap-2 cursor-pointer"
              >
                <Plus size={18} /> New Task
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`grid grid-cols-1 ${viewMode === 'list' ? 'lg:grid-cols-3' : ''} gap-6`}>
            {/* Task List or Calendar */}
            <div className={`${viewMode === 'list' ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {tasks.length ? (
                      tasks
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .map((task) => (
                          <TaskItem
                            key={task._id}
                            task={task}
                            onToggleComplete={handleToggle}
                            onDelete={deleteTask}
                            onEdit={(task) => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            onUpdate={updateTask}
                            isSelected={selectedIds.includes(task._id)}   
                            onSelect={handleSelect}   
                          />
                        ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <EmptyState
                          type="tasks"
                          onAction={() => {
                            setEditingTask(null);
                            setIsModalOpen(true);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCalendar tasks={tasks} />
                </motion.div>
              )}
            </div>

            {/* Insights (Only show in list view or rearrange for calendar view, we'll keep it simple and hide/show based on grid) */}
            {viewMode === 'list' && (
              <div className="hidden lg:flex flex-col gap-6 animate-in delay-300">
                <div className="card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-main mb-2">
                    Completion
                  </h3>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {completedTasks} of {totalTasks} tasks done ({completionPercent}
                    %)
                  </p>
                </div>

                <div className="card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-main mb-2">
                    Upcoming Deadlines
                  </h3>
                  {upcomingDeadlines.length ? (
                    <ul className="space-y-2 text-sm">
                      {upcomingDeadlines.slice(0, 3).map((task) => (
                        <li
                          key={task._id}
                          className="flex items-center gap-2 text-main"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          {task.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    nextTask ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-main">
                          {nextTask.title}
                        </p>

                        <p className="text-xs text-muted">
                          Due on{" "}
                          {new Date(nextTask.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted">
                        No upcoming tasks 🎉
                      </p>
                    )
                  )}
                </div>

                <div
                  className={`card p-4 ${
                    isOverloaded
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {isOverloaded
                      ? "Too many high-priority tasks"
                      : "Priority load is healthy"}
                  </p>
                  <p className="text-xs mt-1 opacity-80">
                    {isOverloaded
                      ? "Consider rescheduling or delegating."
                      : "You’re pacing this well."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal - Moved outside the animate-in container to prevent bounding box constraints */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskFormModal
            task={editingTask}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
}

