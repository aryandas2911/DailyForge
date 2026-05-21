import { useState, useEffect } from "react";
import { Circle, CheckCircle2, Plus, X } from "lucide-react";

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
      { id: 3, text: "", completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem("dailyforge_notes", JSON.stringify(notes));
  }, [notes]);

  const handleChange = (id, value) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text: value } : n));
  };

  const toggleComplete = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  };

  const addNote = () => {
    setNotes([...notes, { id: Date.now(), text: "", completed: false }]);
  };

  const removeNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="card p-6 shadow-sm flex flex-col">
      <h3
        className="text-3xl font-medium text-center mb-8 text-main"
        style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
      >
        Notes
      </h3>
      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <div key={note.id} className="flex items-center gap-4 group relative">
            <button
              onClick={() => toggleComplete(note.id)}
              className="flex-shrink-0 text-muted hover:text-primary transition-colors cursor-pointer mt-1"
            >
              {note.completed ? (
                <CheckCircle2 size={22} className="text-primary" />
              ) : (
                <Circle size={22} strokeWidth={1.5} />
              )}
            </button>
            <input
              type="text"
              value={note.text}
              onChange={(e) => handleChange(note.id, e.target.value)}
              placeholder="Write a note..."
              className={`w-full bg-transparent border-b-2 border-dotted outline-none text-base py-2 transition-all ${
                note.completed
                  ? "text-muted line-through border-transparent opacity-70"
                  : "text-main border-soft focus:border-primary"
              }`}
            />
            <button
              onClick={() => removeNote(note.id)}
              className="absolute right-0 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-opacity cursor-pointer p-1"
              aria-label="Delete note"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
      
      <button 
        onClick={addNote}
        className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary mt-6 transition-colors cursor-pointer w-max"
      >
        <Plus size={18} /> Add Note
      </button>
    </div>
  );
}
