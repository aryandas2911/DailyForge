import { useState, useEffect } from "react";
import { X, Tag , ClipboardList , AlignLeft , Flag, ClipboardPlus , Plus} from "lucide-react";
import { CATEGORIES } from "../../utils/categoryUtils";
import { createPortal } from "react-dom";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;

export default function TaskFormModal({ task, onClose, onSubmit, errorMessage, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  const today = new Date();
  const todayStr =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDateStr =
    maxDateObj.getFullYear() +
    "-" +
    String(maxDateObj.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(maxDateObj.getDate()).padStart(2, "0");

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
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      setDueDate(
        task.dueDate
        ? new Date(task.dueDate)
        .toLocaleString("sv-SE")
        .replace(" ", "T")
        .slice(0, 16)
        : ""
      );
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    onError?.("");
  }, [task, onError]);

  /* ---------------- body scroll lock ---------------- */
  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflowY = "scroll";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflowY = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);

    return () =>
      document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    onError?.("");

    if (!title.trim()) return onError?.("Title is required");
    if (!priority) return onError?.("Priority is required");
    if (!dueDate) return onError?.("Due date is required");

    if (!task && dueDate < todayStr) {
       return alert("Due date cannot be in the past");
    }

    if (dueDate > maxDateStr) {
      return alert("Due date cannot be more than 1 year in the future");
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags,
      status: "Due",
      priority,
      dueDate,
    });
  };

  const toggleTag = (tagName) => {
    if (tagName === "Other") {
      // toggle showing the custom input
      setShowOtherInput((s) => !s);
      return;
    }
    setTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

const addCustomTag = () => {
  const raw = customTagInput.trim();

  if (!raw) return;

  const lower = raw.toLowerCase();

  const exists = tags.some(
    (t) => t.toLowerCase() === lower
  );

  if (!exists) {
    setTags((prev) => [...prev, raw]);
  }

  setCustomTagInput("");
  setShowOtherInput(false);
};

const removeTag = (tagName) => {
  setTags((prev) =>
    prev.filter((t) => t !== tagName)
  );
};

const customTags = tags.filter(
  (t) => !TAGS.includes(t)
);

return createPortal(
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg animate-fadeIn"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    aria-modal="true"
    role="dialog"
  >
    <div
      className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in delay-100 border border-soft"
      onMouseDown={(e) => e.stopPropagation()}
    >

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:bg-white/10"
        aria-label="Close modal"
      >
        <X size={20} />
      </button>

      <div className="bg-teal-900 px-8 pt-5 pb-4">
        <div className="flex items-center justify-between">

          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
            <ClipboardPlus
              size={28}
              className="text-teal-100"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
              {task ? "Edit Task" : "New Task"}
            </span>

            <h2 className="mt-2 text-2xl font-semibold text-white leading-tight">
              {task
                ? "Update your task"
                : "What do you need to get done?"}
            </h2>
          </div>

        </div>
      </div>
        </h2>
        <p className="text-sm text-teal-400 mt-2">
          {task ? "Make your changes below" : "Fill in the details and hit add task."}
        </p>
        </div>
        </div>
        </div>


        <form onSubmit={handleSubmit} className="px-6  pt-5 border-t border-gray-100 space-y-3">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

       
          {/* Title */}
 <div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
    Task name <span className="text-red-500">*</span>
  </label>

  <div className="relative mt-2 ">
    
    {/* Icon */}
    <ClipboardList
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-800 transition-transform duration-300 hover:scale-105"
    />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Enter task title"
              required
            />
          </div>
          </div>

          {/* Description */}
            <div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
   Description
  </label>
  <div className="relative mt-2">
    <AlignLeft 
           size={18}  
           className="absolute left-4 top-1/4 -translate-y-1/2 text-teal-800"
           />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="Add task details or notes (optional)"
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
                    : "text-muted"
              }`}
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          </div>

{/* Tags */}
<div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
    Tags
  </label>

  {/* Predefined tags */}
  <div className="mt-2 flex flex-wrap gap-2">
    {TAGS.map((tag) => {
      const isSelected = tags.includes(tag);

      return (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isSelected
              ? "ring-2 ring-offset-1"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {tag}
        </button>
      );
    })}
  </div>

  {/* Custom tag input */}
  {showOtherInput && (
    <div className="relative mt-3 flex gap-2">
      <Tag
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-800"
      />

      <input
        type="text"
        value={customTagInput}
        onChange={(e) => setCustomTagInput(e.target.value)}
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        placeholder="Enter custom tag"
      />

      <button
        type="button"
        onClick={addCustomTag}
        className="btn btn-primary px-3 py-1.5"
      >
        Add
      </button>
    </div>
  )}

  {/* Custom tags display */}
  {customTags.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-2">
      {customTags.map((ct) => (
        <div
          key={ct}
          className="px-3 py-1 rounded-full bg-soft text-main flex items-center gap-2"
        >
          <span className="text-xs font-medium">{ct}</span>

          <button
            type="button"
            onClick={() => removeTag(ct)}
            className="text-xs text-red-500 px-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}

  <p className="text-xs text-muted mt-2">
    Select one or more tags or add custom tags
  </p>
</div>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-2 gap-3">
          <div>
<div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
    Priority
  </label>

  <div className="relative mt-2">
    <Flag
      size={18}
      className={`absolute left-4 top-1/2 -translate-y-1/2 
      ${
        priority === "Low"
          ? "text-green-500"
          : priority === "Medium"
          ? "text-yellow-500"
          : "text-red-500"
      }`}
    />

    <select
      value={priority}
      onChange={(e) => setPriority(e.target.value)}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      required
    >
      {priorities.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  </div>
</div>

{/* Due Date */}
<div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
    Due Date
  </label>

  <input
    type="datetime-local"
    value={dueDate}
    min={task ? undefined : todayStr}
    max={maxDateStr}
    onChange={(e) => setDueDate(e.target.value)}
    onClick={(e) => e.target.showPicker?.()}
    className="w-full mt-2 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-teal-500/20"
    required
  />
</div>
          </div>

          </div>


          <div className="mx-6 py-4 border-t border-gray-100">
          {/* Submit Button */}
          <div className="grid grid-cols-2 gap-3">
           <button
    type="button"
    onClick={onClose}
    className="w-full border border-gray-300 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-xl flex items-center justify-center gap-2 transition-colors duration-150"
  >
   <X size={20}/> Cancel
  </button>
          <button
            type="submit"
            className="w-full  bg-teal-900 hover:bg-teal-800 text-teal-50 font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors duration-150"
            
          >
            <Plus size={18} />
            {task ? "Update Task" : "Add Task"}
          </button>
  </div>
  </div>
        </form>
      </div>
    </div>,
    document.body
  );
}