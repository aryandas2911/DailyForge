import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import { TAGS } from "../../utils/tagUtils";

const priorities = ["Low", "Medium", "High"];
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_WARNING_LENGTH = 450;

/* ---------------- Custom Priority Dropdown ---------------- */
const PrioritySelect = ({ priority, setPriority }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mt-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2 border rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 transition-colors"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text-main)",
          borderColor: "var(--border)",
          focusRingColor: "var(--primary)",
        }}
      >
        {priority}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {open && (
        <ul
          className="absolute z-[200] w-full mt-1 rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          {priorities.map((p) => (
            <li
              key={p}
              onClick={() => { setPriority(p); setOpen(false); }}
              className="px-3 py-2 cursor-pointer transition-colors duration-150"
              style={{ color: "var(--text-main)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.12)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function TaskFormModal({ task, onClose, onSubmit, errorMessage, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  const today = new Date();
  const todayStr =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDateStr =
    maxDateObj.getFullYear() + "-" +
    String(maxDateObj.getMonth() + 1).padStart(2, "0") + "-" +
    String(maxDateObj.getDate()).padStart(2, "0");

  const inputStyle = {
    backgroundColor: "var(--bg)",
    color: "var(--text-main)",
    borderColor: "var(--border)",
  };

  useEffect(() => {
    if (task) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      setDueDate(
        task.dueDate
          ? new Date(task.dueDate).toLocaleString("sv-SE").replace(" ", "T").slice(0, 16)
          : ""
      );
      /* eslint-enable react-hooks/set-state-in-effect */
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
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError?.("");
    if (!title.trim()) return onError?.("Title is required");
    if (!priority) return onError?.("Priority is required");
    if (!dueDate) return onError?.("Due date is required");
    if (!task && dueDate < todayStr) return alert("Due date cannot be in the past");
    if (dueDate > maxDateStr) return alert("Due date cannot be more than 1 year in the future");
    onSubmit({ title: title.trim(), description: description.trim(), tags, priority, status: "Due", dueDate });
  };

  const toggleTag = (tagName) => {
    if (tagName === "Other") { setShowOtherInput((s) => !s); return; }
    setTags((prev) => prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]);
  };

  const addCustomTag = () => {
    const raw = customTagInput.trim();
    if (!raw) return;
    const lower = raw.toLowerCase();
    const exists = tags.some((t) => t.toLowerCase() === lower);
    if (!exists) setTags((prev) => [...prev, raw]);
    setCustomTagInput("");
    setShowOtherInput(false);
  };

  const removeTag = (tagName) => setTags((prev) => prev.filter((t) => t !== tagName));
  const customTags = tags.filter((t) => !TAGS.includes(t));

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center pt-40 pb-10 px-4 backdrop-blur-sm animate-in"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in delay-100"
        style={{
          backgroundColor: "var(--bg)",
          border: "1px solid var(--border)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(45,168,159,0.10)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>
          {task ? "Edit Task" : "New Task"}
        </h2>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>Title</label>
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
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>Description</label>
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
                description.length >= DESCRIPTION_MAX_LENGTH ? "text-red-500"
                : description.length >= DESCRIPTION_WARNING_LENGTH ? "text-yellow-500"
                : ""
              }`}
              style={description.length < DESCRIPTION_WARNING_LENGTH ? { color: "var(--text-muted)" } : {}}
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all`}
                    style={{
                      backgroundColor: isSelected ? "rgba(45,168,159,0.15)" : "rgba(45,168,159,0.05)",
                      color: isSelected ? "var(--primary)" : "var(--text-muted)",
                      border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      opacity: isSelected ? 1 : 0.75,
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {showOtherInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  style={inputStyle}
                  placeholder="Enter custom tag (e.g., 'Essay')"
                />
                <button type="button" onClick={addCustomTag} className="btn btn-primary px-3 py-1.5">
                  Add
                </button>
              </div>
            )}

            {customTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customTags.map((ct) => (
                  <div
                    key={ct}
                    className="px-3 py-1 rounded-full flex items-center gap-2"
                    style={{
                      backgroundColor: "rgba(45,168,159,0.10)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: "var(--text-main)" }}>{ct}</span>
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

            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Select one or more tags or choose Other to add a custom tag
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>Priority</label>
            <PrioritySelect priority={priority} setPriority={setPriority} />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>Due Date</label>
            <input
              type="datetime-local"
              value={dueDate}
              min={task ? undefined : todayStr}
              max={maxDateStr}
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ ...inputStyle, colorScheme: "dark" }}
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="w-full btn btn-primary py-2 mt-2 hover-lift">
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}