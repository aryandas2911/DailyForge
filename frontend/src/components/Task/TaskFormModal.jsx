import { useState, useEffect } from "react";
import { X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const priorities = ["Low", "Medium", "High"];

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(task.tags || "");
      setPriority(task.priority || "Low");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!priority) return alert("Priority is required");
    if (!dueDate) return alert("Due date is required");

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags.trim(),
      priority,
      dueDate,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold text-main mb-6">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-main mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-white/50 border border-soft rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-sm transition-all"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-main mb-1 block">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full p-2.5 bg-white/50 border border-soft rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-sm transition-all"
              placeholder="Optional task description"
              rows={3}
              maxLength={300}
            />

            <p
              className={`text-xs mt-1 text-right font-medium ${
                description.length >= 300
                  ? "text-red-500"
                  : description.length >= 250
                    ? "text-yellow-500"
                    : "text-gray-400"
              }`}
            >
              {description.length}/300
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-main mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 bg-white/50 border border-soft rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-sm transition-all cursor-pointer"
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
              <label className="text-sm font-medium text-main mb-1 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-white/50 border border-soft rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-sm transition-all cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-main mb-1 block">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2.5 bg-white/50 border border-soft rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] shadow-sm transition-all"
              placeholder="e.g. Upskilling, College, Personal"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn btn-primary py-2.5 mt-6 hover-lift text-base font-semibold shadow-md"
            onSubmit={handleSubmit}
          >
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

