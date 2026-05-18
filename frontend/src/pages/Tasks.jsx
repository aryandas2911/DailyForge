import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskItem from "../components/Task/TaskItem";
import TaskFormModal from "../components/Task/TaskFormModal";
import { Plus, ArrowLeft, ClipboardList, Sparkles, Dumbbell, BookOpen, Droplet, Book } from "lucide-react";

// Example tasks for empty state
const EXAMPLE_TASKS = [
  { 
    title: "Morning Workout", 
    icon: Dumbbell,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    category: "Health",
    priority: "Medium",
    description: "30 minutes of exercise"
  },
  { 
    title: "Study DSA", 
    icon: BookOpen,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    category: "Learning",
    priority: "High",
    description: "Practice algorithms and data structures"
  },
  { 
    title: "Drink Water", 
    icon: Droplet,
    iconColor: "text-cyan-500",
    bgColor: "bg-cyan-50",
    category: "Health",
    priority: "Low",
    description: "Stay hydrated throughout the day"
  },
  { 
    title: "Read 10 Pages", 
    icon: Book,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
    category: "Personal",
    priority: "Low",
    description: "Continue current book"
  },
];

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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

  const highPriorityCount = tasks.filter(
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
              className="rounded-lg p-2 border border-soft text-muted hover:bg-white cursor-pointer"
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

        {/* Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 animate-in delay-200">
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
                  />
                ))
            ) : (
              <div className="rounded-2xl border border-dashed border-soft py-16 px-8 text-center bg-white/50">
                {/* Icon with animation */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <ClipboardList 
                      size={80} 
                      className="text-primary/20" 
                      strokeWidth={1.5}
                    />
                    <Sparkles 
                      size={24} 
                      className="absolute -top-2 -right-2 text-primary animate-pulse" 
                    />
                  </div>
                </div>

                {/* Heading */}
                <h3 className="text-2xl font-bold text-main mb-2">
                  No tasks yet
                </h3>
                
                {/* Subheading */}
                <p className="text-muted mb-8 max-w-md mx-auto">
                  Start organizing your day! Create your first task or choose from our suggestions below.
                </p>

                {/* Primary CTA Button */}
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="btn btn-primary px-6 py-3 text-base mb-10 cursor-pointer inline-flex items-center gap-2 hover-lift"
                >
                  <Plus size={20} />
                  Create Your First Task
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6 max-w-md mx-auto">
                  <div className="flex-1 h-px bg-soft"></div>
                  <span className="text-xs text-muted uppercase tracking-wider">
                    Popular task ideas
                  </span>
                  <div className="flex-1 h-px bg-soft"></div>
                </div>

                {/* Example Task Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {EXAMPLE_TASKS.map((example, index) => {
                    const IconComponent = example.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 rounded-xl border border-soft bg-white"
                      >
                        {/* Icon with background */}
                        <div className={`${example.bgColor} p-2 rounded-lg`}>
                          <IconComponent 
                            size={24} 
                            className={example.iconColor}
                          />
                        </div>
                        
                        {/* Task Info */}
                        <div className="flex-1">
                          <p className="font-medium text-main">
                            {example.title}
                          </p>
                          <p className="text-xs text-muted">
                            {example.category} · {example.priority} Priority
                          </p>
                        </div>

                        {/* Add Icon - Placeholder for future functionality */}
                        <Plus 
                          size={18} 
                          className="text-muted" 
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Footer Tip */}
                <p className="text-xs text-muted mt-8 italic">
                  💡 Tip: Click "Create Your First Task" above to get started
                </p>
              </div>
            )}
          </div>

          {/* Insights */}
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
                <p className="text-xs text-muted">No urgent deadlines 🎉</p>
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
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
