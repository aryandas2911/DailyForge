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
    <div className="card p-0 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <StickyNote size={20} style={{ color: "var(--primary)" }} />
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--text-main)" }}
          >
            Quick Notes
          </h3>
        </div>
        <span
          className="text-sm font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--text-muted)",
          }}
        >
          {completedCount}/{notes.length} done
        </span>
      </div>

      {/* Notes List */}
      <div className="px-6 py-4 flex flex-col gap-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-center gap-3 group relative rounded-lg px-2 py-2.5 transition-colors"
            style={{
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <button
              onClick={() => toggleComplete(note.id)}
              className="flex-shrink-0 transition-colors cursor-pointer"
              style={{ color: note.completed ? "var(--primary)" : "var(--text-muted)" }}
            >
              {note.completed ? (
                <CheckCircle2 size={22} />
              ) : (
                <Circle size={22} strokeWidth={1.5} />
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
              className="w-full bg-transparent outline-none text-base resize-none overflow-hidden"
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
              className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded-md"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
              aria-label="Delete note"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Note Button */}
      <div
        className="px-6 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={addNote}
          className="flex items-center gap-2 text-base font-medium transition-colors cursor-pointer w-max rounded-lg px-3 py-1.5"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <Plus size={18} /> Add Note
        </button>
      </div>
    </div>
  );
}
