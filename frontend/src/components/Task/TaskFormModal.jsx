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

    <div
      className="
    fixed inset-0 z-50
    bg-black/40

    flex items-end md:items-center justify-center

    md:px-4

    overflow-hidden
  "
    >

      <div
        className="
      relative bg-white shadow-xl

      w-full
      md:max-w-md

      rounded-t-3xl
      md:rounded-2xl

      p-5 md:p-6

      max-h-[90vh] md:max-h-fit overflow-y-auto md:overflow-visible

      animate-in slide-in-from-bottom duration-300

      scrollbar-hide
    "
      >

        <div className="md:hidden flex justify-center mb-4">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="
        absolute top-4 right-4
        p-1 rounded-full
        hover:bg-gray-100
        transition-colors
      "
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-main mb-5">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-main">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
            w-full mt-1 p-3
            border border-soft
            rounded-xl
            outline-none

            focus:ring-(--primary)
            focus:border-(--primary)
          "
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
              onChange={(e) => setDescription(e.target.value)}
              className="
            w-full mt-1 p-3
            border border-soft
            rounded-xl
            outline-none
            resize-none

            focus:ring-(--primary)
            focus:border-(--primary)
          "
              placeholder="Optional task description"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-main">
              Tags
            </label>

            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="
            w-full mt-1 p-3
            border border-soft
            rounded-xl
            outline-none

            focus:ring-(--primary)
            focus:border-(--primary)
          "
              placeholder="Upskilling, College, Personal, Other"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-main">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="
            w-full mt-1 p-3
            border border-soft
            rounded-xl
            outline-none
            bg-white

            focus:ring-(--primary)
            focus:border-(--primary)
          "
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
            <label className="text-sm font-medium text-main">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="
            w-full mt-1 p-3
            border border-soft
            rounded-xl
            outline-none

            focus:ring-(--primary)
            focus:border-(--primary)
          "
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="
          w-full
          btn btn-primary

          py-3 mt-3

          rounded-xl

          hover-lift
        "
          >
            {task ? "Update Task" : "Add Task"}
          </button>

        </form>
      </div>
    </div>


  );
}
