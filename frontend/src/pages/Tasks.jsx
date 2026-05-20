import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useTasks from "../hooks/useTasks";
import TaskItem from "../components/Task/TaskItem";
import TaskFormModal from "../components/Task/TaskFormModal";
import { Plus, ArrowLeft, Filter } from "lucide-react";
import { CATEGORIES } from "../utils/categoryUtils";
import EmptyState from "../components/EmptyState";

export default function Tasks() {
  const navigate = useNavigate();
  const { getTasks, updateTask, bulkDelete } = useTasks();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    await bulkDelete(selectedIds);
    setSelectedIds([]);
    await fetchTasks();
    setSuccessMessage("Deleted selected tasks");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /** --- Handlers --- */
  const handleToggle = async (task) => {
    await updateTask(task._id, {
      status: task.status === "Completed" ? "Due" : "Completed",
    });
    await fetchTasks();
    setSuccessMessage("Task updated");
    setTimeout(() => setSuccessMessage(""), 3000);
  };


  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks();
      setSuccessMessage("Task deleted");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleTask = async (id) => {
    try {
      await api.put(`/tasks/${id}`);
      await fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (id, updates) => {
    await updateTask(id, updates);
    await fetchTasks();
  };

  const handleSubmit = async (data) => {
    setTaskError("");
    try {
      setIsSubmitting(true);
      if (editingTask) {
        await updateTask(editingTask._id, data);
        await fetchTasks();
        setSuccessMessage("Task updated successfully");
      } else {
        await api.post("/tasks", { ...data, status: "Due" });
        await fetchTasks();
        setSuccessMessage("Task created successfully");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsSubmitting(false);
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      setTaskError(err.message || "Failed to save task");
    }
  };

  const toggleCategoryFilter = (categoryName) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  /** --- Filtered Tasks --- */
  const filteredTasks = selectedCategories.length === 0
    ? tasks
    : tasks.filter(task =>
        task.tags && task.tags.some(tag => selectedCategories.includes(tag))
      );

  /** --- Insights --- */
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === "Completed").length;
  const completionPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const upcomingDeadlines = filteredTasks.filter((task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    const due = new Date(task.dueDate);
    return due >= now && due <= threeDaysFromNow;
  });
//changed logic
  const nextTask = tasks
  .filter((task) => task.dueDate && task.status !== "Completed")
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const highPriorityCount = filteredTasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed"
  ).length;
  const isOverloaded = highPriorityCount >= 3;

  return (
    <div className="min-h-screen app-bg px-6 lg:px-12 py-8 animate-in">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 flex-wrap animate-in delay-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg p-2 border border-soft text-muted hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
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

        {/* Category Filter */}
        <div className="animate-in delay-150">
          <div className="card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-main" />
              <h3 className="text-sm font-semibold text-main">Filter by Category</h3>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="ml-auto text-xs text-primary hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.name);
                return (
                  <button
                    key={category.name}
                    onClick={() => toggleCategoryFilter(category.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-offset-1'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: category.bgColor,
                      color: category.color,
                      ringColor: category.color,
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="animate-in delay-180">
          {tasks.map((task) => (
            <div key={task._id} className="p-2 border-b flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleTask(task._id)}
                  className="btn btn-sm btn-outline"
                >
                  Complete
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 animate-in delay-200">
            {filteredTasks.length ? (
              filteredTasks
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggleComplete={handleToggle}
                    // fix : Ensure onDelete is explicitely reciving the id
                    onDelete={(id) => deleteTask(id)}
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
  <EmptyState
    type="tasks"
    onAction={() => {
      setEditingTask(null);
      setIsModalOpen(true);
    }}
  />
)}
          </div>

          {/* Insights */}
          <div className="hidden lg:flex flex-col gap-6 animate-in delay-300">
            <div className="card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-main mb-2">
                Completion
              </h3>
              <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
               // updated deadlines
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
                  ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                  : "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
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
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskFormModal
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setTaskError("");
          }}
          onSubmit={handleSubmit}
          errorMessage={taskError}
          onError={setTaskError}
        />
      )}
    </div>
  );
}
