import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import TaskItem from "../components/Task/TaskItem";
import TaskFormModal from "../components/Task/TaskFormModal";
import KanbanBoard from "../components/Task/KanbanBoard";
import {
  Plus,
  ArrowLeft,
  Filter,
  Trash2,
  StickyNote,
  X,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Kanban,
} from "lucide-react";
import { getCategoryColor } from "../utils/categoryUtils";
import { TAGS } from "../utils/tagUtils";
import EmptyState from "../components/EmptyState";
import NotesWidget from "../components/Task/NotesWidget";

const TASKS_PER_PAGE = 10;

export default function Tasks() {
  const navigate = useNavigate();
  const {
    tasks,
    pagination,
    page,
    setPage,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
    bulkUpdate,
  } = useTasks({ initialLimit: TASKS_PER_PAGE });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [durationModalTask, setDurationModalTask] = useState(null);
  const [actualDuration, setActualDuration] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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

  const handleToggle = async (task) => {
    try {
      if (task.status !== "Completed") {
        setDurationModalTask(task);
        setActualDuration("");
      } else {
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
        ? prev.filter((category) => category !== categoryName)
        : [...prev, categoryName]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedCategories([]);
  };

  const filteredTasks = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const title = String(task.title ?? "").toLowerCase();
      const matchesSearch =
        !normalizedSearchTerm || title.includes(normalizedSearchTerm);

      const matchesCategory =
        selectedCategories.length === 0 ||
        (Array.isArray(task.tags) &&
          task.tags.some((tag) => selectedCategories.includes(tag)));

      const isCompleted = task.status === "Completed";
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "completed"
            ? isCompleted
            : !isCompleted;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategories, statusFilter, tasks]);

  const totalPages = pagination.totalPages;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  const pageTasks = filteredTasks.length;

  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== "all" || selectedCategories.length > 0;

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed").length;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const upcomingDeadlines = filteredTasks.filter((task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    const due = new Date(task.dueDate);
    return due >= now && due <= threeDaysFromNow;
  });

  const nextTask = [...filteredTasks]
    .filter((task) => task.dueDate && task.status !== "Completed")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const highPriorityCount = filteredTasks.filter(
    (task) => task.priority === "High" && task.status !== "Completed"
  ).length;
  const isOverloaded = highPriorityCount >= 3;

  return (
    <div className="min-h-screen app-bg px-4 sm:px-6 lg:px-12 py-8 animate-in">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in delay-100 relative z-40">
          <div className="flex items-start sm:items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg p-2.5 border border-soft text-muted dark:text-gray-200 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-main tracking-tight">
                Tasks
              </h1>
              <p className="text-sm text-muted mt-1">
                {completedTasks}/{pageTasks} completed on this page &middot;{" "}
                {totalTasks} total tasks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowBulkEdit((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition cursor-pointer"
                >
                  <Pencil size={14} /> Edit ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}

            <button
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer border ${
                isNotesOpen
                  ? "bg-primary text-white border-transparent shadow-md"
                  : "bg-white dark:bg-slate-800 text-main border-soft hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
              style={isNotesOpen ? { backgroundColor: "var(--primary)" } : {}}
            >
              {isNotesOpen ? <X size={18} /> : <StickyNote size={18} />}
              <span className="hidden sm:inline">
                {isNotesOpen ? "Close Notes" : "Quick Notes"}
              </span>
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
                setTaskError("");
              }}
              className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer shadow-md"
            >
              <Plus size={18} /> <span className="hidden sm:inline">New Task</span>
            </button>
          </div>

          {/* Notes Popover */}
          {isNotesOpen && (
            <>
              {/* Mobile View */}
              <div className="block md:hidden w-full mt-2 animate-in slide-in-from-top-2">
                <NotesWidget />
              </div>

              {/* Desktop View */}
              <div className="hidden md:block absolute top-full right-0 mt-3 z-50 w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2">
                <NotesWidget />
              </div>
            </>
          )}
        </div>

        {/* Bulk Edit Panel */}
        {showBulkEdit && selectedIds.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-soft p-5 rounded-xl shadow-sm flex flex-col sm:flex-row flex-wrap gap-5 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-1.5 w-full sm:w-auto flex-1">
              <label className="text-sm font-semibold text-main">Set Priority</label>
              <select
                value={bulkPriority}
                onChange={(e) => setBulkPriority(e.target.value)}
                className="w-full p-2.5 border border-soft rounded-lg bg-gray-50 text-main dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">-- No Change --</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-auto flex-1">
              <label className="text-sm font-semibold text-main">Set Due Date</label>
              <input
                type="datetime-local"
                value={bulkDueDate}
                onChange={(e) => setBulkDueDate(e.target.value)}
                className="w-full p-2.5 border border-soft rounded-lg bg-gray-50 text-main dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleBulkEdit}
                disabled={!bulkPriority && !bulkDueDate}
                className="flex-1 sm:flex-none btn btn-primary px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply to {selectedIds.length}
              </button>
              <button
                onClick={() => setShowBulkEdit(false)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-soft text-muted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters & Search Section */}
        <div className="bg-white dark:bg-slate-900 border border-soft rounded-xl p-5 shadow-sm space-y-5 animate-in delay-150">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-main">Filters & View</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline cursor-pointer transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <label className="flex flex-col gap-1.5 md:col-span-6 lg:col-span-5">
              <span className="text-sm font-medium text-muted">Search by title</span>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-soft bg-gray-50 text-main dark:bg-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </label>

            {/* Status Filter */}
            <label className="flex flex-col gap-1.5 md:col-span-3 lg:col-span-4">
              <span className="text-sm font-medium text-muted">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-soft bg-gray-50 text-main dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </label>

            {/* View Toggle */}
            <div className="flex flex-col gap-1.5 md:col-span-3 lg:col-span-3 justify-end">
              <span className="text-sm font-medium text-muted hidden md:block opacity-0">View</span>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg border border-soft">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <LayoutList size={16} /> List
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "board"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <Kanban size={16} /> Board
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="pt-2 border-t border-soft">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-muted">Categories:</span>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tagName) => {
                  const isSelected = selectedCategories.includes(tagName);
                  const cat = getCategoryColor(tagName);

                  return (
                    <button
                      key={tagName}
                      onClick={() => toggleCategoryFilter(tagName)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "ring-2 ring-offset-2 scale-105"
                          : "opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                        borderColor: isSelected ? cat.color : "transparent",
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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Task List / Board */}
          <div className="xl:col-span-2 space-y-6 animate-in delay-200">
            {filteredTasks.length ? (
              viewMode === "list" ? (
                // CRITICAL FIX: Added flex-col and gap-4 to properly space individual TaskItems
                <div className="flex flex-col gap-4">
                  {filteredTasks.map((task) => (
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
                  ))}
                </div>
              ) : (
                <KanbanBoard
                  viewMode="board"
                  tasks={filteredTasks}
                  onToggleComplete={handleToggle}
                  onDelete={(id) => deleteTask(id)}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onUpdate={updateTask}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                />
              )
            ) : tasks.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-soft p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                  <Search size={24} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-main">No tasks found</h3>
                  <p className="text-muted mt-2">
                    Try adjusting your filters or search term to find what you're looking for.
                  </p>
                </div>
                <button onClick={clearFilters} className="btn btn-primary px-6 py-2 mt-4">
                  Clear all filters
                </button>
              </div>
            ) : (
              <EmptyState
                type="tasks"
                onAction={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-soft">
                <button
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="px-4 py-2 rounded-lg border border-soft font-medium text-main flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <p className="text-sm font-medium text-muted bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                  Page {page} of {totalPages}
                </p>
                <button
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={!hasNextPage}
                  className="px-4 py-2 rounded-lg bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Insights Sidebar (Only visible in list view) */}
          {viewMode === "list" && (
            <div className="hidden xl:flex flex-col gap-6 animate-in delay-300">
              <div className="bg-white dark:bg-slate-900 border border-soft rounded-xl p-6 shadow-sm flex flex-col gap-8 sticky top-6">
                
                {/* Completion Progress */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                    Completion Progress
                  </h3>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {completionPercent > 0 && (
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${completionPercent}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm font-medium text-main">
                      {completedTasks} / {pageTasks} Tasks
                    </p>
                    <p className="text-sm font-bold text-primary">{completionPercent}%</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />

                {/* Upcoming Deadlines */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                    Upcoming Deadlines
                  </h3>
                  {upcomingDeadlines.length ? (
                    <ul className="space-y-3">
                      {upcomingDeadlines.slice(0, 3).map((task) => (
                        <li
                          key={task._id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
                        >
                          <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-main line-clamp-1">{task.title}</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : nextTask ? (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <p className="text-sm font-semibold text-main line-clamp-2">{nextTask.title}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                        Next due: {new Date(nextTask.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                      <p className="text-sm text-muted">No upcoming deadlines 🎉</p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />

                {/* Priority Load */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                    Priority Load
                  </h3>
                  <div
                    className={`rounded-xl p-5 border ${
                      isOverloaded
                        ? "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                        : "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/30"
                    }`}
                  >
                    <p className={`text-sm font-bold ${isOverloaded ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>
                      {isOverloaded ? "High Priority Overload" : "Healthy Workload"}
                    </p>
                    <p className={`text-xs mt-2 leading-relaxed ${isOverloaded ? "text-red-600/80 dark:text-red-400/80" : "text-green-600/80 dark:text-green-400/80"}`}>
                      {isOverloaded
                        ? `You have ${highPriorityCount} high-priority tasks pending. Consider delegating or rescheduling to avoid burnout.`
                        : "Your high-priority tasks are well-balanced. Keep up the good pace!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {/* Duration Modal */}
      {durationModalTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-slate-800 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-main mb-2">Complete Task</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              How long did you actually take to complete <span className="font-semibold text-main">"{durationModalTask.title}"</span>?
            </p>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-main">Duration (minutes)</span>
              <input
                type="number"
                min="1"
                value={actualDuration}
                onChange={(e) => setActualDuration(e.target.value)}
                className="w-full p-3 border border-soft rounded-xl bg-gray-50 text-main dark:bg-slate-800 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g. 45"
              />
            </label>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setDurationModalTask(null);
                  setActualDuration("");
                }}
                className="px-5 py-2.5 rounded-xl font-medium border border-soft text-main hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActualDurationSubmit}
                className="btn btn-primary px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
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
