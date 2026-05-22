import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskItem from "../components/Task/TaskItem";
import TaskFormModal from "../components/Task/TaskFormModal";
import { Plus, ArrowLeft, Filter, Trash2 } from "lucide-react";
import { CATEGORIES } from "../utils/categoryUtils";
import { getCategoryColor } from "../utils/categoryUtils";
import EmptyState from "../components/EmptyState";

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask, bulkDelete, bulkUpdate } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    await bulkDelete(selectedIds);
    setSelectedIds([]);
  };
  const handleBulkEdit = async () => {
    if (!bulkPriority && !bulkDueDate) return;
    const updates = {};
    if (bulkPriority) updates.priority = bulkPriority;
    if (bulkDueDate) updates.dueDate = bulkDueDate;
    await bulkUpdate(selectedIds, updates);
    setSelectedIds([]);
    setBulkPriority("");
    setBulkDueDate("");
    setShowBulkEdit(false);
  };

  const [durationModalTask, setDurationModalTask] = useState(null);
  const [actualDuration, setActualDuration] = useState("");

 /** --- Handlers --- */
const handleToggle = async (task) => {
  try {
    if (task.status !== "Completed") {
      // Open modal to enter actual duration
      setDurationModalTask(task);
      setActualDuration("");
    } else {
      // Mark back to Due
      await updateTask(task._id, {
        status: "Due",
        actualDuration: null,
      });
    }
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};

const handleActualDurationSubmit = async () => {
  const durationValue = Number(actualDuration);

  if (Number.isNaN(durationValue) || durationValue <= 0) {
    alert("Please enter a valid duration in minutes");
    return;
  }

  try {
    await updateTask(durationModalTask._id, {
      status: "Completed",
      actualDuration: durationValue,
    });

    setDurationModalTask(null);
    setActualDuration("");
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};

  const handleSubmit = async (data) => {
    setTaskError("");
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
      setTaskError(err.message || "Failed to save task");
    }
  };

  const toggleCategoryFilter = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const filteredTasks =
    selectedCategories.length === 0
      ? tasks
      : tasks.filter(
          (task) => task.tags && task.tags.some((tag) => selectedCategories.includes(tag))
        );

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === "Completed").length;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const upcomingDeadlines = filteredTasks.filter((task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    const due = new Date(task.dueDate);
    return due >= now && due <= threeDaysFromNow;
  });
//changed logic
  const nextTask = filteredTasks
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
              <h1 className="text-3xl font-bold text-main tracking-tight">Tasks</h1>
              <p className="text-sm text-muted mt-1">
                {completedTasks}/{totalTasks} completed · Stay consistent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowBulkEdit((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition cursor-pointer"
                >
                  ✏️ Edit Selected ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-danger flex items-center gap-2 cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <Trash2 size={18} /> Delete Selected ({selectedIds.length})
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
                setTaskError("");
              }}
              className="btn btn-primary flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} /> New Task
            </button>
          </div>
        </div>
        {showBulkEdit && selectedIds.length > 0 && (
        <div className="card p-4 shadow-sm flex flex-wrap gap-4 items-end animate-in">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-main">Set Priority</label>
            <select
              value={bulkPriority}
              onChange={(e) => setBulkPriority(e.target.value)}
              className="p-2 border border-soft rounded-lg bg-transparent text-main dark:bg-slate-800"
            >
              <option value="">-- Select --</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-main">Set Due Date</label>
            <input
              type="datetime-local"
              value={bulkDueDate}
              onChange={(e) => setBulkDueDate(e.target.value)}
              className="p-2 border border-soft rounded-lg bg-transparent text-main"
            />
          </div>
          <button
            onClick={handleBulkEdit}
            disabled={!bulkPriority && !bulkDueDate}
            className="btn btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply to {selectedIds.length} Tasks
          </button>
          <button
            onClick={() => setShowBulkEdit(false)}
            className="px-4 py-2 rounded-lg border border-soft text-muted hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      )}

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
              {["Homework", "Routine", "Creative", "Other"].map((tagName) => {
                const isSelected = selectedCategories.includes(tagName);
                const cat = getCategoryColor(tagName);
                return (
                  <button
                    key={tagName}
                    onClick={() => toggleCategoryFilter(tagName)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected ? "ring-2 ring-offset-1" : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: cat.bgColor,
                      color: cat.color,
                      ringColor: cat.color,
                    }}
                  >
                    {tagName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task List */}
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
              <h3 className="text-lg font-semibold text-main mb-2">Completion</h3>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                {completionPercent > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                )}
              </div>
              <p className="text-xs text-muted mt-1">
                {completedTasks} of {totalTasks} tasks done ({completionPercent}%)
              </p>
            </div>

            <div className="card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-main mb-2">Upcoming Deadlines</h3>
              {upcomingDeadlines.length ? (
                <ul className="space-y-2 text-sm">
                  {upcomingDeadlines.slice(0, 3).map((task) => (
                    <li key={task._id} className="flex items-center gap-2 text-main">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {task.title}
                    </li>
                  ))}
                </ul>
              ) : nextTask ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-main">{nextTask.title}</p>
                  <p className="text-xs text-muted">
                    Due on {new Date(nextTask.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted">No upcoming tasks 🎉</p>
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
                {isOverloaded ? "Too many high-priority tasks" : "Priority load is healthy"}
              </p>
              <p className="text-xs mt-1 opacity-80">
                {isOverloaded ? "Consider rescheduling or delegating." : "You’re pacing this well."}
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

      {durationModalTask && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold text-main mb-2">
              Complete Task
            </h2>

            <p className="text-sm text-muted mb-4">
              How long did you actually take to complete "
              {durationModalTask.title}"?
            </p>

            <input
              type="number"
              min="1"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              className="w-full p-2 border border-soft rounded-lg"
              placeholder="Actual duration in minutes"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setDurationModalTask(null);
                  setActualDuration("");
                }}
                className="px-4 py-2 rounded-lg border border-soft"
              >
                Cancel
              </button>

              <button
                onClick={handleActualDurationSubmit}
                className="btn btn-primary px-4 py-2"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}