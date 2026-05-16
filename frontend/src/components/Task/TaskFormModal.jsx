import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";
import { CATEGORIES } from "../../utils/categoryUtils";

const priorities = ["Low", "Medium", "High"];

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const showToast = useToast();

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  
  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDateStr = maxDateObj.getFullYear() + '-' + String(maxDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(maxDateObj.getDate()).padStart(2, '0');

  useEffect(() => {
    if (task) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { showToast("Title is required", "error"); return; }
    if (!priority) { showToast("Priority is required", "error"); return; }
    if (!dueDate) { showToast("Due date is required", "error"); return; }

    const todayStr = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    if (dueDate < todayStr) {
      showToast("Due date cannot be in the past", "error");
      return;
    }
    
    if (dueDate > maxDateStr) {
      showToast("Due date cannot be more than 1 year in the future", "error");
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags,
      priority,
      dueDate,
    });
  };

  const toggleCategory = (categoryName) => {
    setTags(prev => 
      prev.includes(categoryName)
        ? prev.filter(tag => tag !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in delay-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-main mb-4">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-main">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-main">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              placeholder="Optional task description"
              rows={3}
              maxLength={300}
            />

            <p
              className={`text-sm mt-1 text-right ${
                description.length >= 300
                  ? "text-red-500"
                  : description.length >= 250
                    ? "text-yellow-500"
                    : "text-gray-500"
              }`}
            >
              {description.length}/300
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium text-main">Categories</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected = tags.includes(category.name);
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
            <p className="text-xs text-muted mt-1">Select one or more categories</p>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-main">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              required
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-main">Due Date</label>
            <input
              type="date"
              value={dueDate}
              min={todayStr}
              max={maxDateStr}
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn btn-primary py-2 mt-2 hover-lift"
            onSubmit={handleSubmit}
          >
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
