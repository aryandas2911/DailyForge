import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TAGS } from "../../utils/tagUtils";
import FormError from "../common/FormError";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;
const TITLE_MAX_LENGTH = 30;
const TITLE_WARNING_LENGTH = 25;

export default function TaskFormModal({
  task,
  tasks = [],
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
  const [dependsOn, setDependsOn] = useState("");
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
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      setDependsOn(task.dependsOn?._id || "");
      if (task?.dueDate) {
        const dt = new Date(task.dueDate);

        const datePart = dt.toISOString().slice(0, 10);
        const timePart = dt.toTimeString().slice(0, 5);

        setDueDate(datePart);
        setDueTime(timePart);
      }
    }
    onError?.("");
  }, [task, onError]);

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
          dependsOn,
        }),
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagName) => {
    if (tagName === "Other") {
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

  const customTags = tags.filter((t) => !TAGS.includes(t));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-xs px-4 animate-in">
      <div
        className="absolute inset-0"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        aria-modal="true"
        role="dialog"
      />
      
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh] z-10 box-border scrollbar-thin transition-colors duration-300"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <FormError error={errorMessage} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
              placeholder="Task title"
              maxLength={TITLE_MAX_LENGTH}
              required
            />
            <p
              className={`text-[11px] font-bold mt-1 text-right tracking-wide ${
                title.length >= TITLE_MAX_LENGTH
                  ? "text-rose-500"
                  : title.length >= TITLE_WARNING_LENGTH
                    ? "text-amber-500"
                    : "text-slate-400"
              }`}
            >
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400 resize-none leading-relaxed"
              placeholder="Optional task description"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <p
              className={`text-[11px] font-bold mt-1 text-right tracking-wide ${
                description.length >= DESCRIPTION_MAX_LENGTH
                  ? "text-rose-500"
                  : description.length >= DESCRIPTION_WARNING_LENGTH
                    ? "text-amber-500"
                    : "text-slate-400"
              }`}
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tags</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#3b8ea0] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/60 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {showOtherInput && (
              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
                  placeholder="Custom tag name..."
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            )}

            {customTags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {customTags.map((ct) => (
                  <div
                    key={ct}
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="text-xs font-bold">{ct}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(ct)}
                      disabled={isSubmitting}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold px-0.5 cursor-pointer"
                      aria-label={`Remove tag ${ct}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1.5">
              Select one or more tags or choose Other to add a custom tag
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all cursor-pointer box-border"
              required
            >
              {priorities.map((p) => (
                <option key={p} value={p} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Depends On
            </label>
            <select
              value={dependsOn}
              onChange={(e) => setDependsOn(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all cursor-pointer box-border"
            >
              <option value="" className="dark:bg-slate-900 text-slate-400">No Dependency</option>
              {tasks
                .filter((t) => t._id !== task?._id)
                .map((t) => (
                  <option
                    key={t._id}
                    value={t._id}
                    className="dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {t.title}
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1.5">
              Select a prerequisite task
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Date</label>
            <input
              type="date"
              value={dueDate}
              min={task ? undefined : todayStr}
              max={maxDateStr}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors mt-6 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
    </div>,
    document.body,
  );
}