import { useState, useEffect } from "react";
import { X, Tag , ClipboardList , AlignLeft , Flag, ClipboardPlus , Plus} from "lucide-react";
import { CATEGORIES } from "../../utils/categoryUtils";

const priorities = ["Low", "Medium", "High"];

export default function TaskFormModal({ task, onClose, onSubmit, errorMessage, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  
  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDateStr = maxDateObj.getFullYear() + '-' + String(maxDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(maxDateObj.getDate()).padStart(2, '0');

  useEffect(() => {
    if (task) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task.title || "");
      setDescription(task.description || "");
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setPriority(task.priority || "Low");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    onError?.("");
  }, [task, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError?.("");
    if (!title.trim()) return onError?.("Title is required");
    if (!priority) return onError?.("Priority is required");
    if (!dueDate) return onError?.("Due date is required");

    if (dueDate < todayStr) {
      return alert("Due date cannot be in the past");
    }
    
    if (dueDate > maxDateStr) {
      return alert("Due date cannot be more than 1 year in the future");
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags,
      priority,
      dueDate,
    });
  };

  const toggleCategory = (categoryName) => {
    setTags(prev => 
      prev.includes(categoryName)
        ? prev.filter(tag => tag !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in delay-100 border border-soft">
        

        <div className=" bg-teal-900 px-8 pt-5 pb-4 ">
          <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
          <ClipboardPlus size={28} className="text-teal-100"/>
          </div>
          {/* text  */}
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
              {task ? "Edit Task" : "New Task"}
            </span>
          
        <h2 className=" mt-2 text-2xl font-semibold text-white leading-tight">
          {task ? "Update your task" : "What do you need to get done?"}
        </h2>
        <p className="text-sm text-teal-400 mt-2">
          {task ? "Make your changes below" : "Fill in the details and hit add task."}
        </p>
        </div>
        </div>
        </div>


        <form onSubmit={handleSubmit} className="px-6  pt-5 border-t border-gray-100 space-y-3">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

       
          {/* Title */}
 <div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
    Task name <span className="text-red-500">*</span>
  </label>

  <div className="relative mt-2 ">
    
    {/* Icon */}
    <ClipboardList
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-800 transition-transform duration-300 hover:scale-105"
    />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Enter task title"
              required
            />
          </div>
          </div>

          {/* Description */}
            <div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
   Description
  </label>
  <div className="relative mt-2">
    <AlignLeft 
           size={18}  
           className="absolute left-4 top-1/4 -translate-y-1/2 text-teal-800"
           />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full  rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Add task details or notes (optional)"
              rows={2}
               maxLength={300}
            />

            <p
              className={`text-sm mt-1 text-right ${
                description.length >= 300
                  ? "text-red-500"
                  : description.length >= 250
                    ? "text-yellow-500"
                    : "text-muted"
              }`}
            >
              {description.length}/300
            </p>
          </div>
          </div>

          {/* Categories */}
          <div>
  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
   Tags (optional)
  </label>

  <div className="relative mt-2">
    <Tag
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-800"
    />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full  rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Upskilling , Work , Personal"
            />
          </div>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-2 gap-3">
          <div>
             <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
        Priority
      </label>
      <div className="relative mt-2">
    <Flag
      size={18}
      className={`absolute left-4 top-1/2 -translate-y-1/2 
      ${priority === "Low" ? "text-green-500" : 
        priority === "Medium" ? "text-yellow-500" : 
        "text-red-500"}`}
    />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        required
      >
        {priorities.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
        </select>
          </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
        Due date
      </label>
      <input
        type="date"
        value={dueDate}
         min={todayStr}
              max={maxDateStr}
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
        className="w-full mt-2 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-teal-500/20"
        required
      />
          </div>

          </div>


          <div className="mx-6 py-4 border-t border-gray-100">
          {/* Submit Button */}
          <div className="grid grid-cols-2 gap-3">
           <button
    type="button"
    onClick={onClose}
    className="w-full border border-gray-300 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-xl flex items-center justify-center gap-2 transition-colors duration-150"
  >
   <X size={20}/> Cancel
  </button>
          <button
            type="submit"
            className="w-full  bg-teal-900 hover:bg-teal-800 text-teal-50 font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors duration-150"
            onSubmit={handleSubmit}
          >
            <Plus size={18} />
            {task ? "Update Task" : "Add Task"}
          </button>
  </div>
  </div>
        </form>
      </div>
    </div>
  );
}
