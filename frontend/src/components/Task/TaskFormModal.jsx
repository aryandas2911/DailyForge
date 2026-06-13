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
  const WEEK_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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

    // ── Recurrence state ────────────────────────────────────────────────────────
    const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState("daily");
    const [recurrenceDays, setRecurrenceDays] = useState([]);
    const [recurrenceMonthDay, setRecurrenceMonthDay] = useState(1);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
    // ────────────────────────────────────────────────────────────────────────────

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
        // Recurrence population
        if (task?.recurrence?.enabled) {
          setRecurrenceEnabled(true);
          setRecurrenceFrequency(task.recurrence.frequency || "daily");
          setRecurrenceDays(task.recurrence.days || []);
          setRecurrenceMonthDay(task.recurrence.monthDay || 1);
          setRecurrenceEndDate(
            task.recurrence.endDate
              ? new Date(task.recurrence.endDate).toISOString().slice(0, 10)
              : "",
          );
        } else {
          setRecurrenceEnabled(false);
          setRecurrenceFrequency("daily");
          setRecurrenceDays([]);
          setRecurrenceMonthDay(1);
          setRecurrenceEndDate("");
        }
      }
      onError?.("");
    },  [task, onError]);

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

    const toggleRecurrenceDay = (day) => {
      setRecurrenceDays((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
      );
    };

    const buildRecurrence = () => {
      if (!recurrenceEnabled) return { enabled: false };
      return {
        enabled: true,
        frequency: recurrenceFrequency,
        days: recurrenceFrequency === "weekly" ? recurrenceDays : [],
        monthDay:
          recurrenceFrequency === "monthly" ? recurrenceMonthDay : null,
        endDate: recurrenceEndDate || null,
      };
    };

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

      // Validate weekly recurrence — must pick at least one day
      if (recurrenceEnabled && recurrenceFrequency === "weekly" && recurrenceDays.length === 0) {
        return onError?.("Please select at least one day for weekly recurrence");
      }

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
            dependsOn: dependsOn || null,
            recurrence: buildRecurrence(),
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

            <FormError error={errorMessage} />

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
                          bg-transparent text-main dark:bg-slate-800"
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
                          bg-transparent text-main dark:bg-slate-800"
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
                      className="flex-1 p-2 border border-soft rounded-lg bg-transparent text-main dark:bg-slate-800"
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

              {/* Depends On */}
  <div>
    <label className="text-sm font-medium text-main">
      Depends On
    </label>

    <select
      value={dependsOn}
      onChange={(e) => setDependsOn(e.target.value)}
      disabled={isSubmitting}
      className="w-full mt-1 p-2 border border-soft rounded-lg
                focus:ring-(--primary) focus:border-(--primary)
                bg-transparent text-main dark:bg-slate-800"
    >
      <option value="">No Dependency</option>

    {tasks
    .filter((t) => t._id !== task?._id)
    .map((t) => (
      <option
        key={t._id}
        value={t._id}
        className="dark:bg-slate-800"
      >
        {t.title}
      </option>
    ))}

    </select>

    <p className="text-xs text-muted mt-1">
      Select a prerequisite task
    </p>
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

              {/* ── Repeat Toggle ─────────────────────────────────────────────── */}
              <div className="border border-soft rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-main">Repeat this task</p>
                    <p className="text-xs text-muted mt-0.5">
                      Auto-create this task on a schedule
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecurrenceEnabled((v) => !v)}
                    disabled={isSubmitting}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                      recurrenceEnabled
                        ? "bg-(--primary)"
                        : "bg-gray-300 dark:bg-slate-600"
                    }`}
                    aria-label="Toggle recurrence"
                    role="switch"
                    aria-checked={recurrenceEnabled}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        recurrenceEnabled ? "translate-x-[19px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {recurrenceEnabled && (
                  <div className="space-y-3 pt-1">
                    {/* Frequency */}
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wide">
                        Frequency
                      </label>
                      <select
                        value={recurrenceFrequency}
                        onChange={(e) => {
                          setRecurrenceFrequency(e.target.value);
                          setRecurrenceDays([]); // reset days on frequency change
                        }}
                        disabled={isSubmitting}
                        className="w-full mt-1 p-2 border border-soft rounded-lg
                                  bg-transparent text-main dark:bg-slate-800 text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Weekly — day picker */}
                    {recurrenceFrequency === "weekly" && (
                      <div>
                        <label className="text-xs font-medium text-muted uppercase tracking-wide">
                          Repeat on
                        </label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {WEEK_DAYS.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleRecurrenceDay(day)}
                              disabled={isSubmitting}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                recurrenceDays.includes(day)
                                  ? "ring-2 ring-(--primary) bg-(--primary)/10 text-(--primary)"
                                  : "opacity-60 hover:opacity-100 border border-soft"
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monthly — day of month */}
                    {recurrenceFrequency === "monthly" && (
                      <div>
                        <label className="text-xs font-medium text-muted uppercase tracking-wide">
                          Day of month
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={recurrenceMonthDay}
                          onChange={(e) =>
                            setRecurrenceMonthDay(Number(e.target.value))
                          }
                          disabled={isSubmitting}
                          className="w-full mt-1 p-2 border border-soft rounded-lg
                                    bg-transparent text-main dark:bg-slate-800 text-sm"
                        />
                      </div>
                    )}

                    {/* Optional end date */}
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wide">
                        End date{" "}
                        <span className="normal-case">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={recurrenceEndDate}
                        min={todayStr}
                        max={maxDateStr}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full mt-1 p-2 border border-soft rounded-lg
                                  bg-transparent text-main text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* ── End Repeat Toggle ─────────────────────────────────────────── */}

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
    