import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TAGS } from "../../utils/tagUtils";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;
const TITLE_MAX_LENGTH = 30;
const TITLE_WARNING_LENGTH = 25;

export default function TaskFormModal({
  task,
  onClose,
  onSubmit,
  errorMessage,
  onError,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const submitLockRef = useRef(false);

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
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      if (task?.dueDate) {
        const dt = new Date(task.dueDate);

        const datePart = dt.toISOString().slice(0, 10); // YYYY-MM-DD
        const timePart = dt.toTimeString().slice(0, 5); // HH:MM

        setDueDate(datePart);
        setDueTime(timePart);
      }
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

    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current) return;

    onError?.("");

    if (!title.trim()) return onError?.("Title is required");
    if (title.trim().length > TITLE_MAX_LENGTH)
      return onError?.(`Title must be ${TITLE_MAX_LENGTH} characters or less`);
    if (!priority) return onError?.("Priority is required");
    if (!dueDate || !dueTime)
      return onError?.("Due date and time are required");

    const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
    const now = new Date();

    if (!task && selectedDateTime < now) {
      return onError?.("Due date/time cannot be in the past");
    }
    const maxDateTime = new Date(maxDateStr + "T23:59:59");
    if (selectedDateTime > maxDateTime) {
      return onError?.("Due date cannot be more than 1 year in the future");
    }

    try {
      submitLockRef.current = true;
      setIsSubmitting(true);
      await Promise.resolve(
        onSubmit({
          title: title.trim(),
          description: description.trim(),
          tags: tags,
          priority,
          status: task ? task.status : "Due",
          dueDate: `${dueDate}T${dueTime}:00`,
        }),
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagName) => {
    if (tagName === "Other") {
      // toggle showing the custom input
      setShowOtherInput((s) => !s);
      return;
    }
    setTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
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
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 flex items-center justify-center 
                 py-10 px-4
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
                   relative border border-soft animate-in delay-100 overflow-y-auto max-h-screen"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1 rounded-full text-main
                     hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-main mb-4">
            {task ? "Edit Task" : "New Task"}
          </h2>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-main">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="w-full mt-1 p-2 border border-soft rounded-lg
                         focus:ring-(--primary) focus:border-(--primary)
                         bg-transparent text-main"
                placeholder="Task title"
                maxLength={TITLE_MAX_LENGTH}
                required
              />
              <p
                className={`text-sm mt-1 text-right ${
                  title.length >= TITLE_MAX_LENGTH
                    ? "text-red-500"
                    : title.length >= TITLE_WARNING_LENGTH
                      ? "text-yellow-500"
                      : "text-muted"
                }`}
              >
                {title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-main">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
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
                      onClick={() => toggleTag(tag)}
                      disabled={isSubmitting}
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

              {/* Other input */}
              {showOtherInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 p-2 border border-soft rounded-lg bg-transparent text-main"
                    placeholder="Enter custom tag (e.g., 'Essay')"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                type="date"
                value={dueDate}
                min={task ? undefined : todayStr}
                max={maxDateStr}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full mt-1 p-2 border border-soft rounded-lg
               focus:ring-(--primary) focus:border-(--primary)
               bg-transparent text-main"
                required
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="text-sm font-medium text-main">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={isSubmitting}
                className="w-full mt-1 p-2 border border-soft rounded-lg
               focus:ring-(--primary) focus:border-(--primary)
               bg-transparent text-main"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary py-2 mt-2 hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? task
                  ? "Updating..."
                  : "Adding..."
                : task
                  ? "Update Task"
                  : "Add Task"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
