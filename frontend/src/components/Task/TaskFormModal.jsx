import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { resolveHasTime } from "../../utils/dueDateUtils";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;

export default function TaskFormModal({ task, onClose, onSubmit, errorMessage, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const getNextQuarterTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    const rounded = new Date(now);
    rounded.setSeconds(0, 0);

    if (roundedMinutes >= 60) {
      rounded.setHours(rounded.getHours() + 1, 0, 0, 0);
    } else {
      rounded.setMinutes(roundedMinutes, 0, 0);
    }

    const hours = String(rounded.getHours()).padStart(2, "0");
    const mins = String(rounded.getMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  const setDateAndTime = (targetDate, targetTime) => {
    setDueDate(targetDate);
    setDueTime(targetTime);
  };

  const applyQuickTime = (type) => {
    const now = new Date();
    if (type === "plus-1h") {
      const next = new Date(now.getTime() + 60 * 60 * 1000);
      const dateStr = next.toLocaleDateString("en-CA");
      const timeStr = next.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setDateAndTime(dateStr, timeStr);
      return;
    }

    if (type === "today-6pm") {
      const dateStr = now.toLocaleDateString("en-CA");
      setDateAndTime(dateStr, "18:00");
      return;
    }

    if (type === "tomorrow-9am") {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const dateStr = tomorrow.toLocaleDateString("en-CA");
      setDateAndTime(dateStr, "09:00");
    }
  };

  const parseDueDate = (value) => {
    if (!value) {
      return { date: "", time: "" };
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { date: value, time: "" };
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return { date: "", time: "" };
    }

    return {
      date: parsed.toLocaleDateString("en-CA"),
      time: parsed.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

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
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      const parsedDue = parseDueDate(task.dueDate);
      const hasTime = resolveHasTime(task.dueDate, task.hasTime);
      setDueDate(parsedDue.date);
      setDueTime(hasTime ? parsedDue.time : "");
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

    const dueDateValue = dueTime ? `${dueDate}T${dueTime}` : dueDate;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags,
      priority,
      dueDate: dueDateValue,
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
              className="w-full mt-1 p-2 border border-soft rounded-lg
                         focus:ring-(--primary) focus:border-(--primary)
                         bg-transparent text-main"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div>
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
              type="date"
              value={dueDate}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setDueDate(selectedDate);
                if (!dueTime) {
                  setDueTime(getNextQuarterTime());
                }
              }}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              required
            />
          </div>

          {/* Due Time */}
          <div>
            <label className="text-sm font-medium text-main">Due Time (optional)</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyQuickTime("plus-1h")}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-soft text-main bg-white hover:bg-(--accent)/30 transition"
              >
                In 1h
              </button>
              <button
                type="button"
                onClick={() => applyQuickTime("today-6pm")}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-soft text-main bg-white hover:bg-(--accent)/30 transition"
              >
                Today 6:00 PM
              </button>
              <button
                type="button"
                onClick={() => applyQuickTime("tomorrow-9am")}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-soft text-main bg-white hover:bg-(--accent)/30 transition"
              >
                Tomorrow 9:00 AM
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
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