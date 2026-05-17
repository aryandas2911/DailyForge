import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { resolveHasTime } from "../../utils/dueDateUtils";

const priorities = ["Low", "Medium", "High"];

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
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

  useEffect(() => {
    if (task) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(task.tags || "");
      setPriority(task.priority || "Low");
      const parsedDue = parseDueDate(task.dueDate);
      const hasTime = resolveHasTime(task.dueDate, task.hasTime);
      setDueDate(parsedDue.date);
      setDueTime(hasTime ? parsedDue.time : "");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!priority) return alert("Priority is required");
    if (!dueDate) return alert("Due date is required");

    const dueDateValue = dueTime ? `${dueDate}T${dueTime}` : dueDate;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags.trim(),
      priority,
      dueDate: dueDateValue,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in delay-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-main mb-4">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-main">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-main">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              placeholder="Optional task description"
              rows={3}
              maxLength={300}
            />

            <p
              className={`text-sm mt-1 text-right ${
                description.length >= 300
                  ? "text-red-500"
                  : description.length >= 250
                    ? "text-yellow-500"
                    : "text-gray-500"
              }`}
            >
              {description.length}/300
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-main">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              placeholder="Upskilling, College, Personal, Other"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-main">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              required
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
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
            onSubmit={handleSubmit}
          >
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
