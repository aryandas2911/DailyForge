import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
            <label className="text-sm font-medium text-main">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              placeholder="Optional task description"
              rows={3}
            />
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
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full mt-1 p-2 border border-soft rounded-lg focus:ring-(--primary) focus:border-(--primary)"
              required
            />
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
