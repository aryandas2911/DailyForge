import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { TAGS } from "../../utils/tagUtils";

const priorities = ["Low", "Medium", "High"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DESCRIPTION_MAX_LENGTH = 500;
const TITLE_MAX_LENGTH = 30;

export default function TaskFormModal({ task, onClose, onSubmit, errorMessage, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [currentView, setCurrentView] = useState("date");
  const [navDate, setNavDate] = useState(new Date());
  const [typedYear, setTypedYear] = useState(String(new Date().getFullYear()));
  const pickerRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      if (task.dueDate) {
        const dt = new Date(task.dueDate);
        const dateVal = dt.toISOString().split("T")[0];
        setDueDate(dateVal);
        setDueTime(dt.toTimeString().slice(0, 5));
        setNavDate(dt);
        setTypedYear(String(dt.getFullYear()));
      }
    } else {
      setTypedYear(String(new Date().getFullYear()));
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

    document.addEventListener("keydown", handleKey);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tag) => {
    if (tag === "Other") {
      setShowOtherInput(!showOtherInput);
    } else {
      setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTagInput.trim() && !tags.includes(customTagInput.trim())) {
      setTags([...tags, customTagInput.trim()]);
      setCustomTagInput("");
      setShowOtherInput(false);
    }
  };

  const displayYear = navDate.getFullYear();
  const displayMonth = navDate.getMonth();

  const handleManualYearInput = (val) => {
    const cleanVal = val.replace(/\D/g, "").slice(0, 4);
    setTypedYear(cleanVal);
    if (cleanVal.length === 4) {
      const newDate = new Date(navDate);
      newDate.setFullYear(parseInt(cleanVal, 10));
      setNavDate(newDate);
      if (dueDate) {
        const currentDueDate = new Date(dueDate);
        currentDueDate.setFullYear(parseInt(cleanVal, 10));
        setDueDate(currentDueDate.toISOString().split("T")[0]);
      }
    }
  };

  const selectDay = (day) => {
    const selected = new Date(displayYear, displayMonth, day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - offset * 60 * 1000);
    setDueDate(localDate.toISOString().split("T")[0]);
    setShowPicker(false);
  };

  const selectMonth = (monthIdx) => {
    const newDate = new Date(navDate);
    newDate.setMonth(monthIdx);
    setNavDate(newDate);
    setCurrentView("date");
  };

  const selectYear = (yearNum) => {
    const newDate = new Date(navDate);
    newDate.setFullYear(yearNum);
    setNavDate(newDate);
    setTypedYear(String(yearNum));
    setCurrentView("date");
  };

  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const startYearRange = Math.floor(displayYear / 10) * 10;
  const yearRange = Array.from({ length: 12 }, (_, i) => startYearRange - 1 + i);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-(--surface) w-full max-w-md p-6 rounded-2xl border border-soft shadow-xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-main"><X size={20} /></button>
        <h2 className="text-xl font-semibold text-main mb-4">{task ? "Edit Task" : "New Task"}</h2>

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit({ title, description, tags, priority, dueDate, dueTime }); }}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-main">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg bg-transparent text-main"
              placeholder="Task title"
              maxLength={TITLE_MAX_LENGTH}
              required
            />
            <p className="text-sm mt-1 text-right text-muted">{title.length}/{TITLE_MAX_LENGTH}</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-main">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg bg-transparent text-main"
              placeholder="Optional task description"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <p className="text-sm mt-1 text-right text-muted">{description.length}/{DESCRIPTION_MAX_LENGTH}</p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-main">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1 rounded-full text-xs ${tags.includes(t) ? 'bg-(--primary) text-white' : 'bg-soft text-main'}`}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                onClick={() => toggleTag("Other")}
                className={`px-3 py-1 rounded-full text-xs ${showOtherInput ? 'bg-(--primary) text-white' : 'bg-soft text-main'}`}
              >
                Other
              </button>
            </div>
            {showOtherInput && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 p-2 border border-soft rounded-lg bg-transparent text-main"
                  placeholder="Enter custom tag (e.g., 'Essay')"
                />
                <button type="button" onClick={addCustomTag} className="bg-(--primary) text-white px-4 rounded-lg text-sm">Add</button>
              </div>
            )}
            <p className="text-xs text-muted mt-2">Select one or more tags or choose Other to add a custom tag</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.filter(t => !TAGS.includes(t)).map(ct => (
                <span key={ct} className="px-2 py-0.5 bg-soft rounded text-xs text-main flex items-center gap-1">
                  {ct} <X size={14} className="cursor-pointer text-red-500" onClick={() => setTags(tags.filter(x => x !== ct))} />
                </span>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-main">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg bg-(--surface) text-main"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Due Date */}
          <div className="relative" ref={pickerRef}>
            <label className="text-sm font-medium text-main">Due Date</label>
            <div className="relative mt-1">
              <input
                type="text"
                readOnly
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onClick={() => setShowPicker(true)}
                className="w-full p-2 pr-10 border border-soft rounded-lg cursor-pointer bg-transparent text-main"
                required
              />
              <CalendarIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>

            {showPicker && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-(--surface) border border-soft rounded-xl shadow-2xl z-50 text-sm select-none">

                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-3 border-b border-soft pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(navDate);
                      if (currentView === "date") prev.setMonth(prev.getMonth() - 1);
                      if (currentView === "year") prev.setFullYear(prev.getFullYear() - 10);
                      setNavDate(prev);
                    }}
                    className="p-1 hover:bg-soft rounded"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1 font-semibold text-main">
                    <button
                      type="button"
                      onClick={() => setCurrentView(currentView === "month" ? "date" : "month")}
                      className="hover:text-(--primary) px-1 py-0.5 rounded hover:bg-soft"
                    >
                      {months[displayMonth]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView(currentView === "year" ? "date" : "year")}
                      className="hover:text-(--primary) px-1 py-0.5 rounded hover:bg-soft"
                    >
                      {displayYear}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(navDate);
                      if (currentView === "date") next.setMonth(next.getMonth() + 1);
                      if (currentView === "year") next.setFullYear(next.getFullYear() + 10);
                      setNavDate(next);
                    }}
                    className="p-1 hover:bg-soft rounded"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day Grid View */}
                {currentView === "date" && (
                  <>
                    <div className="grid grid-cols-7 text-center font-medium text-muted mb-1 text-xs">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {calendarCells.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} />;
                        const isSelected = dueDate === `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => selectDay(day)}
                            className={`p-1.5 rounded-md transition text-xs font-medium ${
                              isSelected ? "bg-(--primary) text-white" : "hover:bg-soft text-main"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Month Grid View */}
                {currentView === "month" && (
                  <div className="grid grid-cols-3 gap-2 py-2">
                    {months.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => selectMonth(idx)}
                        className={`p-2 text-xs rounded-lg font-medium transition ${
                          displayMonth === idx ? "bg-(--primary) text-white" : "hover:bg-soft bg-soft/50 text-main"
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Year View with Manual Input */}
                {currentView === "year" && (
                  <div>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="YYYY"
                        value={typedYear}
                        onChange={(e) => handleManualYearInput(e.target.value)}
                        className="w-full p-1.5 border border-soft rounded-md text-xs bg-transparent text-main focus:ring-1 focus:ring-(--primary) text-center"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto">
                      {yearRange.map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => selectYear(yr)}
                          className={`p-1.5 text-xs rounded transition font-medium ${
                            displayYear === yr ? "bg-(--primary) text-white" : "hover:bg-soft text-main"
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Due Time */}
          <div>
            <label className="text-sm font-medium text-main">Due Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg bg-transparent text-main [color-scheme:dark]"
              required
            />
          </div>

          <button type="submit" className="w-full btn btn-primary py-2">
            {task ? "Update Task" : "Add Task"}
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
      </div>
    </div>,
    document.body
  );
}
