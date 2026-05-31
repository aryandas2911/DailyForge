import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Tag , ClipboardList , AlignLeft , Flag, ClipboardPlus , Plus} from "lucide-react";
import { TAGS } from "../../utils/tagUtils";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;
const TITLE_MAX_LENGTH = 30;
const TITLE_WARNING_LENGTH = 25;

const inputCls =
  "w-full rounded-xl py-2.5 px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
  + " bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl  shadow-2xl animate-in delay-100 "
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
 
        {/* ── Header ── */}
        <div className="bg-teal-900 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <ClipboardPlus size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
                {task ? "Edit Task" : "New Task"}
              </span>
              <h2 className="text-xl font-bold text-white leading-tight">
                {task ? "Update your task" : "What do you need to get done?"}
              </h2>
              <p className="text-xs text-teal-200 mt-0.5">
                {task ? "Make your changes below" : "Fill in the details and hit add task."}
              </p>
            </div>
          </div>
        </div>
 
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 pt-3 space-y-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
 
          {/* Title */}
          <div>
            <label className="text-xs font-bold  uppercase tracking-wide"
            style={{ color: "var(--text-main)" }}
            >
            
              Task name <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <ClipboardList
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--primary)" }}
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className={`${inputCls} pl-9`}

                placeholder="Enter task title"
                maxLength={TITLE_MAX_LENGTH}
                required
              />
            </div>
            <p className={`text-xs mt-0.5 text-right ${title.length >= TITLE_MAX_LENGTH ? "text-red-500" : title.length >= TITLE_WARNING_LENGTH ? "text-yellow-500" : "text-gray-400"}`}>{title.length}/{TITLE_MAX_LENGTH}</p>
          </div>
 
          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide"
            style={{ color: "var(--text-main)" }}
            >
              Description <span className=" font-normal normal-case text-xs">(optional)</span>
            </label>
            <div className="relative mt-1">
              <AlignLeft
                size={16}
                className="absolute left-4 top-3"
                style={{ color: "var(--primary)" }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className={`${inputCls} pl-9 resize-none`}
                placeholder="Add task details or notes (optional)"
                rows={1}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <p className="text-xs mt-0.5 text-right"
            style={{
                color:
                  description.length >= DESCRIPTION_MAX_LENGTH
                    ? "#ef4444"
                    : description.length >= DESCRIPTION_WARNING_LENGTH
                      ? "#eab308"
                      : "var(--text-muted)",
              }}>{description.length}/{DESCRIPTION_MAX_LENGTH}</p>
          </div>
 
          {/* Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide"
            style={{ color: "var(--text-main)" }}
            >
              Tags <span className="text-gray-400 dark:text-gray-500 font-normal normal-case text-xs">(optional)</span>
            </label>
 
            {/* Tag pill buttons */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              
              {TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={isSubmitting}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all" 
                    style={{
                      background: isSelected ? "var(--accent)" : "transparent",
                      border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      color: isSelected ? "var(--text-main)" : "var(--text-muted)",
                      opacity: isSelected ? 1 : 0.75,
                    }}
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
                  className={`${inputCls} flex-1`}
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
 
            {/* Custom tags */}
            {customTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customTags.map((ct) => (
                  <div
                    key={ct}
                    className="px-3 py-1 rounded-full flex items-center gap-2"
                    style={{
                      background: "var(--accent)",
                      border: "1px solid var(--border)",
                      color: "var(--text-main)",
                    }}
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
 
            <p className="text-xs mt-1"  style={{ color: "var(--text-muted)" }}>
              Select one or more tags or choose Other to add a custom tag
            </p>
          </div>
 
          {/* Priority + Due Date + Due Time — all in one row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Priority */}
            <div>
              <label  className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "var(--text-main)" }}>
                Priority
              </label>
              <div className="relative mt-1">
                <Flag
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{
                    color:
                      priority === "Low"
                        ? "#22c55e"
                        : priority === "Medium"
                          ? "#eab308"
                          : "#ef4444",
                  }}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={isSubmitting}
                  className={`${inputCls} pl-9 appearance-none`}
                  required
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}  style={{ background: "var(--surface)" }}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
 
            {/* Due Date */}
            <div>
              <label className="text-xs font-bolduppercase tracking-wide"
              style={{ color: "var(--text-main)" }}
              
              >
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                min={task ? undefined : todayStr}
                max={maxDateStr}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                onClick={(e) => e.target.showPicker?.()}
                className={`${inputCls} mt-1`}
                required
              />
            </div>
 
            {/* Due Time */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "var(--text-main)" }}>
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={isSubmitting}
                onClick={(e) => e.target.showPicker?.()}
                    className={`${inputCls} mt-1`}
                required
              />
            </div>
          </div>
 
          {/* Footer Buttons */}
          <div className="py-3 grid grid-cols-2 gap-3"
            style={{ borderTop: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={16} /> Cancel
            </button>
           <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-900 hover:bg-teal-800 text-teal-50 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors duration-150 disabled:opacity-60"
            >
              <Plus size={16} />
              {isSubmitting
                ? task
                  ? "Updating..."
                  : "Adding..."
                : task
                  ? "Update Task"
                  : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}