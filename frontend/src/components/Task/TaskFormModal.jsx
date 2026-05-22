import { useState, useEffect, useMemo } from "react";
import { X, Sparkles } from "lucide-react";
import { CATEGORIES } from "../../utils/categoryUtils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TAGS } from "../../utils/tagUtils";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;

const QUOTES = [
  "Small steps lead to big changes.",
  "A goal without a plan is just a wish.",
  "Done is better than perfect.",
  "Focus on progress, not perfection.",
  "Clarity leads to confidence.",
  "Start where you are. Use what you have.",
  "One task at a time builds a great life.",
];

export default function TaskFormModal({ task, onClose, onSubmit }) {
export default function TaskFormModal({ task, onClose, onSubmit, errorMessage, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");

  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );
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

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
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
    if (!title.trim()) return alert("Title is required");
    if (!priority) return alert("Priority is required");
    if (!dueDate) return alert("Due date is required");

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags,
      priority,
      dueDate,
    });
  };

  const toggleCategory = (categoryName) => {
    setTags((prev) =>
      prev.includes(categoryName)
        ? prev.filter((t) => t !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center
                 pt-[6vh] px-4 pb-6 overflow-y-auto animate-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in delay-100 overflow-hidden">

        {/* ── Gradient header ── */}
        <div
          className="px-6 py-5 flex items-start justify-between"
          style={{ background: "linear-gradient(135deg, #4eb7b3 0%, #98e1d7 100%)" }}

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
  tags,
  priority,
  status: "Due",
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
    // avoid duplicates (case-insensitive)
    const lower = raw.toLowerCase();
    const exists = tags.some((t) => t.toLowerCase() === lower);
    if (!exists) {
      setTags((prev) => [...prev, raw]);
    }
    setCustomTagInput("");
    setShowOtherInput(false);
  };

  const removeTag = (tagName) => {
    setTags((prev) => prev.filter((t) => t !== tagName));
  };

  // custom tags are tags that are not part of the predefined list (excluding "Other")
  const customTags = tags.filter((t) => !TAGS.includes(t));

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto
                 flex flex-col items-center
                 pt-40 pb-10 px-4
                 bg-black/20 dark:bg-black/50 backdrop-blur-sm
                 animate-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-(--surface) rounded-2xl shadow-xl w-full max-w-md p-6
                   relative border border-soft animate-in delay-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-main
                     hover:bg-gray-100 dark:hover:bg-slate-700"
          aria-label="Close modal"
        >
          <div className="flex-1 pr-4">
            <p className="text-white/70 text-[11px] font-semibold tracking-widest uppercase mb-1">
              {task ? "Edit Task" : "New Task"}
            </p>
            <div className="flex items-start gap-1.5">
              <Sparkles size={13} className="text-white/80 mt-0.5 shrink-0" />
              <p className="text-white text-sm italic leading-snug opacity-90">
                "{quote}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-main uppercase tracking-wide">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 border border-soft rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3]
                         transition-all"
              placeholder="What needs to be done?"
              className="w-full mt-1 p-2 border border-soft rounded-lg
                         focus:ring-(--primary) focus:border-(--primary)
                         bg-transparent text-main"
              placeholder="Task title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-main uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 border border-soft rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3]
                         transition-all resize-none"
              placeholder="Add details (optional)"
              rows={2}
              maxLength={300}
            />
            <p
              className={`text-xs mt-0.5 text-right ${
                description.length >= 300
                  ? "text-red-500"
                  : description.length >= 250
                  ? "text-yellow-500"
                  : "text-gray-400"
            <label className="text-sm font-medium text-main">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg
                         focus:ring-(--primary) focus:border-(--primary)
                         bg-transparent text-main"
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
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {/* Priority + Due Date — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-main uppercase tracking-wide">
                Priority <span className="text-red-400">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-soft rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3]
                           transition-all bg-white"
                required
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-main uppercase tracking-wide">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-soft rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#4eb7b3]/40 focus:border-[#4eb7b3]
                           transition-all"
                required
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-semibold text-main uppercase tracking-wide">
              Categories
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATEGORIES.map((category) => {
                const isSelected = tags.includes(category.name);
          {/* Tags (predefined + other) */}
          <div>
            <label className="text-sm font-medium text-main">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "ring-2 ring-offset-1 shadow-sm"
                        : "opacity-55 hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: category.bgColor,
                      color: category.color,
                      ringColor: isSelected ? category.color : undefined,
                    }}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected ? "ring-2 ring-offset-1" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Other input */}
            {showOtherInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 p-2 border border-soft rounded-lg bg-transparent text-main"
                  placeholder="Enter custom tag (e.g., 'Essay')"
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

            {/* Show custom tags (non-predefined) */}
            {customTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
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
                      aria-label={`Remove tag ${ct}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted mt-1">
              Select one or more tags or choose Other to add a custom tag
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-main">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg
                         focus:ring-(--primary) focus:border-(--primary)
                         bg-transparent text-main dark:bg-slate-800"
              required
            >
              {priorities.map((p) => (
                <option key={p} value={p} className="dark:bg-slate-800">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-main">Due Date</label>
            <input
  type="datetime-local"
  value={dueDate}
  min={task ? undefined : todayStr}
  max={maxDateStr}
  onChange={(e) => setDueDate(e.target.value)}
  onClick={(e) => e.target.showPicker?.()}
  className="w-full mt-1 p-2 border border-soft rounded-lg
             focus:ring-(--primary) focus:border-(--primary)
             bg-transparent text-main"
  required
/>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full btn btn-primary py-2.5 hover-lift font-semibold tracking-wide mt-1"
            className="w-full btn btn-primary py-2 mt-2 hover-lift"
          >
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}