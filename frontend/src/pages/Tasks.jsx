import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTasks from "../hooks/useTasks";
import useDebounce from "../hooks/useDebounce";
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

// toast popup component - shows at bottom right
function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform z-50 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
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
  // Filtering is client-side, so debounce the term the filter reads off of —
  // the input stays instant, but we avoid re-filtering on every keystroke (#11).
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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

  const [toast, setToast] = useState({ message: "", type: "success" });
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleDeleteTask = async (id) => {
    const res = await deleteTask(id);
    if (res?.success) {
      showToast("Task deleted successfully!", "success");
    } else if (res) {
      showToast(res.message, "error");
    }
  };

  const handleBulkDelete = async () => {
    const res = await bulkDelete(selectedIds);
    setSelectedIds([]);
    if (res?.success) {
      showToast("Selected tasks deleted successfully!", "success");
    } else if (res) {
      showToast(res.message, "error");
    }
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
    const normalizedSearchTerm = debouncedSearchTerm.trim().toLowerCase();

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
  }, [debouncedSearchTerm, selectedCategories, statusFilter, tasks]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 animate-in transition-colors duration-300 w-full box-border">
      <div className="max-w-[1200px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-6 flex-wrap relative z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl p-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Tasks
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {completedTasks}/{pageTasks} completed on this page &middot; {totalTasks} total tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowBulkEdit((prev) => !prev)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  <Pencil size={14} /> <span>Edit Selected ({selectedIds.length})</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Trash2 size={14} /> <span>Delete Selected ({selectedIds.length})</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition border cursor-pointer shadow-xs ${
                isNotesOpen
                  ? "bg-[#3b8ea0] border-[#3b8ea0] text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {isNotesOpen ? <X size={14} /> : <StickyNote size={14} />}
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
              className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} /> New Task
            </button>
          </div>

          {isNotesOpen && (
            <div className="w-full md:w-auto md:absolute md:top-full md:right-0 md:mt-3 md:z-50 md:w-96">
              <NotesWidget />
            </div>
          )}
        </div>

        {/* Bulk Edit Panel */}
        {showBulkEdit && selectedIds.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap gap-4 items-end animate-in">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Set Priority
              </label>
              <select
                value={bulkPriority}
                onChange={(e) => setBulkPriority(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900">-- Select --</option>
                <option value="Low" className="dark:bg-slate-900">Low</option>
                <option value="Medium" className="dark:bg-slate-900">Medium</option>
                <option value="High" className="dark:bg-slate-900">High</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Set Due Date
              </label>
              <input
                type="datetime-local"
                value={bulkDueDate}
                onChange={(e) => setBulkDueDate(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none"
              />
            </div>
            <button
              onClick={handleBulkEdit}
              disabled={!bulkPriority && !bulkDueDate}
              className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply to {selectedIds.length} Tasks
            </button>
            <button
              onClick={() => setShowBulkEdit(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer h-9"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5 animate-in">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Search & Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-bold text-[#3b8ea0] hover:text-[#4eb7b3] cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Search by title</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type keywords..."
                className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none cursor-pointer box-border"
              >
                <option value="all" className="dark:bg-slate-900">All statuses</option>
                <option value="pending" className="dark:bg-slate-900">Pending</option>
                <option value="completed" className="dark:bg-slate-900">Completed</option>
              </select>
            </div>

            <div className="flex items-center justify-end h-9 bg-slate-100 dark:bg-slate-800/60 p-1 border border-slate-200/40 dark:border-slate-700 rounded-xl max-w-xs w-full sm:ml-auto box-border">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 shadow-xs text-slate-800 dark:text-white"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutList size={14} />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "board"
                    ? "bg-white dark:bg-slate-700 shadow-xs text-slate-800 dark:text-white"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700"
                }`}
              >
                <Kanban size={14} />
                <span>Board</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category Tags</span>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-rose-500"
                >
                  Clear tags
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tagName) => {
                const isSelected = selectedCategories.includes(tagName);
                const cat = getCategoryColor(tagName);

                return (
                  <button
                    key={tagName}
                    onClick={() => toggleCategoryFilter(tagName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-offset-2 dark:ring-offset-slate-900 shadow-xs"
                        : "opacity-60 hover:opacity-100"
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

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>

        {/* Content Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 animate-in">
            {filteredTasks.length ? (
              viewMode === "list" ? (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggleComplete={handleToggle}
                    onDelete={handleDeleteTask}
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
                <KanbanBoard
                  viewmode="board"
                  tasks={filteredTasks}
                  onToggleComplete={handleToggle}
                  onDelete={handleDeleteTask}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onUpdate={updateTask}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                />
              )
            ) : tasks.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching tasks</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Try a different search term or clear the active filters.
                </p>
                <button onClick={clearFilters} className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer">
                  Clear filters
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Page {page} of {totalPages}
                </p>

                <button
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={!hasNextPage}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-xs font-bold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Panel Insights */}
          {viewMode === "list" && (
            <div className="hidden lg:flex flex-col gap-6 animate-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6 transition-colors duration-300">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                    Completion
                  </h3>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {completionPercent > 0 && (
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-[#3b8ea0] transition-all"
                        style={{ width: `${completionPercent}%` }}
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 leading-normal">
                    {completedTasks} of {pageTasks} page tasks done ({completionPercent}%)
                  </p>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 w-full" />

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                    Upcoming Deadlines
                  </h3>
                  {upcomingDeadlines.length ? (
                    <ul className="space-y-2.5 mt-0 pl-0 list-none">
                      {upcomingDeadlines.slice(0, 3).map((task) => (
                        <li
                          key={task._id}
                          className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 truncate"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : nextTask ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {nextTask.title}
                      </p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Due on {new Date(nextTask.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">No upcoming tasks</p>
                  )}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 w-full" />

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                    Priority Load
                  </h3>
                  <div
                    className={`rounded-xl p-4 border transition ${
                      isOverloaded
                        ? "bg-rose-50/40 border-rose-100 text-rose-700 dark:bg-rose-950/10 dark:border-rose-900/30 dark:text-rose-400"
                        : "bg-emerald-50/40 border-emerald-100 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-400"
                    }`}
                  >
                    <p className="text-sm font-bold">
                      {isOverloaded
                        ? "Elevated high-priority workload"
                        : "Priority load is healthy"}
                    </p>
                    <p className="text-xs font-medium mt-1 opacity-80 leading-relaxed">
                      {isOverloaded
                        ? "Consider re-scheduling non-urgent metrics to safeguard long-term performance balances."
                        : "Your baseline pacing metrics show robust scheduling layouts."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 transition-all duration-300">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Complete Task
            </h2>

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              How long did you actually take to complete "
              <span className="font-semibold text-slate-800 dark:text-slate-200">{durationModalTask.title}</span>"?
            </p>

            <input
              type="number"
              min="1"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
              placeholder="Actual duration in minutes"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setDurationModalTask(null);
                  setActualDuration("");
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleActualDurationSubmit}
                className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}