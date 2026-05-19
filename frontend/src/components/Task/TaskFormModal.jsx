import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { CATEGORIES } from "../../utils/categoryUtils";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;

const PrioritySelect = ({ priority, setPriority }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mt-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2 border border-border rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        style={{ backgroundColor: "var(--bg)", color: "var(--color-text-main)" }}
      >
        {priority}
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          className="absolute z-50 w-full mt-1 rounded-lg border border-border shadow-lg overflow-hidden"
          style={{ backgroundColor: "var(--surface)" }}
        >
          {priorities.map((p) => (
            <li
              key={p}
              onClick={() => { setPriority(p); setOpen(false); }}
              className="px-3 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-500 hover:text-white"
              style={{ color: "var(--color-text-main)" }}
            >
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDateStr = maxDateObj.getFullYear() + '-' + String(maxDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(maxDateObj.getDate()).padStart(2, '0');

  useEffect(() => {
  if (task) {
    queueMicrotask(() => {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
    });
  }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!priority) return alert("Priority is required");
    if (!dueDate) return alert("Due date is required");
    if (dueDate < todayStr) return alert("Due date cannot be in the past");
    if (dueDate > maxDateStr) return alert("Due date cannot be more than 1 year in the future");

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags,
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

const inputStyle = {
  backgroundColor: "var(--bg)",  // #0f172a in dark — darker than surface
  color: "var(--color-text-main)",
  borderColor: "var(--color-border)",
};
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in">
      <div
        className="rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in delay-100 border border-border"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors"
          style={{ color: "var(--color-text-muted)", backgroundColor: "var(--color-bg)" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-accent)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--color-bg)"}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text-main)" }}>
          {task ? "Edit Task" : "New Task"}
        </h2>

        

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={inputStyle}
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={inputStyle}
              placeholder="Optional task description"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <p
              className={`text-sm mt-1 text-right ${
                description.length >= DESCRIPTION_MAX_LENGTH
                  ? "text-red-500"
                  : description.length >= DESCRIPTION_WARNING_LENGTH
                    ? "text-yellow-500"
                    : "text-muted"
              }`}
              style={description.length < 250 ? { color: "var(--color-text-muted)" } : {}}
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              Categories
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected = tags.includes(category.name);
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected ? "ring-2 ring-offset-1" : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: category.bgColor,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              Select one or more categories
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              Priority
            </label>
            <PrioritySelect priority={priority} setPriority={setPriority} />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              min={todayStr}
              max={maxDateStr}
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ ...inputStyle, colorScheme: "dark" }}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full btn btn-primary py-2 mt-2 hover-lift"
          >
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}