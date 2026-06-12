import { useState, useEffect } from "react";
import { Circle, CheckCircle2, Plus, X, StickyNote } from "lucide-react";

export default function NotesWidget() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("dailyforge_notes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
    return [
      { id: 1, text: "", completed: false },
      { id: 2, text: "", completed: false },
      { id: 3, text: "", completed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem("dailyforge_notes", JSON.stringify(notes));
  }, [notes]);

  const handleChange = (id, value) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, text: value } : n)));
  };

  const toggleComplete = (id) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const addNote = () => {
    setNotes([...notes, { id: Date.now(), text: "", completed: false }]);
  };

  const removeNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const completedCount = notes.filter((n) => n.completed).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-colors duration-300 w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <StickyNote size={20} className="text-[#3b8ea0]" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Quick Notes
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {completedCount}/{notes.length} done
        </span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-center gap-3 group relative rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <button
              onClick={() => toggleComplete(note.id)}
              className={`flex-shrink-0 transition-colors cursor-pointer ${
                note.completed ? "text-[#3b8ea0]" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
              }`}
            >
              {note.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} strokeWidth={2} />
              )}
            </button>
            <textarea
              value={note.text}
              onChange={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                handleChange(note.id, e.target.value);
              }}
              rows={1}
              placeholder="Write a note..."
              className="w-full bg-transparent outline-none text-base resize-none overflow-hidden dark:placeholder-slate-500"
              style={{
                color: note.completed ? "var(--text-muted)" : "var(--text-main)",
                textDecoration: note.completed ? "line-through" : "none",
                opacity: note.completed ? 0.6 : 1,
                borderBottom: `1px dotted ${note.completed ? "transparent" : "var(--border)"}`,
                paddingBottom: "4px",
                paddingTop: "2px",
                lineHeight: "1.4",
                minHeight: "28px"
              }}
            />
            <button
              onClick={() => removeNote(note.id)}
              className="absolute right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer p-1 rounded-lg"
              aria-label="Delete note"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/10">
        <button
          onClick={addNote}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#3b8ea0] dark:hover:text-white transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Note
        </button>
      </div>
    </div>
  );
}