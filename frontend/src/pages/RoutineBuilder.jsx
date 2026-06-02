import { useEffect, useState, useCallback, useRef } from "react";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Plus, Save } from "lucide-react";
import { toPng } from "html-to-image";
import api from "../api/axios.js";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const START_MINUTES = 6 * 60;
const END_MINUTES = 22 * 60;

const EVENT_COLORS = [
  "#0f766e",
  "#1d4ed8",
  "#be123c",
  "#7c3aed",
  "#b45309",
  "#15803d",
  "#c2410c",
  "#0369a1",
];

const colorFromKey = (value) => {
  const source = String(value || "routine");
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
};

const ROUTINE_DRAFT_STORAGE_KEY = "dailyforge:routine-builder:draft";

const safeReadDraft = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ROUTINE_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to read routine draft", error);
    return null;
  }
};

const safeWriteDraft = (draft) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ROUTINE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn("Failed to save routine draft", error);
  }
};

const safeClearDraft = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ROUTINE_DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear routine draft", error);
  }
};

export default function RoutineBuilder() {
  const { addTask, tasks } = useTasks();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [isRoutineEventModalOpen, setIsRoutineEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [routineEventName, setRoutineEventName] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventColor, setEventColor] = useState("#0f766e");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const gridRef = useRef(null);

  const exportToImage = async () => {
    if (!gridRef.current) return;
    try {
      // html-to-image handles CSS variables and Google Fonts without CORS issues
      const url = await toPng(gridRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "My_Weekly_Routine.png";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export routine as image.");
    }
  };

  const timeStringToMinutes = (timeStr) => {
    const [hours, minutes] = String(timeStr).split(":").map(Number);
    return (hours * 60) + minutes;
  };

  const minutesToTimeString = (minutes) => {
    const safeValue = Math.max(START_MINUTES, Math.min(END_MINUTES, minutes));
    const hours = String(Math.floor(safeValue / 60)).padStart(2, "0");
    const mins = String(safeValue % 60).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  const resetRoutineEventForm = () => {
    setEditingEventId(null);
    setRoutineEventName("");
    setSelectedDays([]);
    setEventStartTime("09:00");
    setEventEndTime("10:00");
    setEventColor("#0f766e");
  };

  const openRoutineEventModal = () => {
    resetRoutineEventForm();
    setIsRoutineEventModalOpen(true);
  };

  const openEditRoutineEventModal = (eventId) => {
    const event = scheduledTasks.find((task) => task.id === eventId);
    if (!event) return;

    setEditingEventId(event.id);
    setRoutineEventName(event.title || "");
    setSelectedDays([event.day]);
    setEventStartTime(minutesToTimeString(event.startTime));
    setEventEndTime(minutesToTimeString(event.startTime + event.duration));
    setEventColor(event.color || "#0f766e");
    setIsRoutineEventModalOpen(true);
  };

  // Modal open/close
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleSubmit = async (data) => {
    try {
      await addTask({ ...data, status: "Due" });
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  const confirmSaveRoutine = async () => {
    const items = scheduledTasks.map((task) => ({
      taskId: task.taskId,
      day: task.day,
      startTime: task.startTime,
      duration: task.duration,
    }));

    try {
      const res = await api.post("/routines", {
        name: routineName,
        description,
        items,
      });

safeClearDraft();

const createdRoutine = res.data.routine || res.data.routines?.[0];

if (createdRoutine) {
  setSavedRoutines((prevRoutines) => [
    createdRoutine,
    ...prevRoutines.filter(
      (routine) => routine._id !== createdRoutine._id
    ),
  ]);
}

setIsSaveModalOpen(false);
setRoutineName("");
setDescription("");
alert("Routine saved successfully");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to save routine";
      alert(errorMessage);
    }
  };

  const openSaveRoutineModal = () => {
    const hasTasks = scheduledTasks.length > 0;
    if (!hasTasks) {
      alert("No routine events scheduled yet.");
      return;
    }
    const now = new Date();
    const dateLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setRoutineName(`Weekly Routine ${dateLabel}`);
    setIsSaveModalOpen(true);
  };

  const handleSubmitRoutineEvent = async (e) => {
    e.preventDefault();

    if (!routineEventName.trim()) {
      alert("Please enter a routine name.");
      return;
    }
    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }

    const start = timeStringToMinutes(eventStartTime);
    const end = timeStringToMinutes(eventEndTime);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      alert("End time must be after start time.");
      return;
    }

    const duration = end - start;
    if (duration < 10) {
      alert("Duration must be at least 10 minutes.");
      return;
    }

    // Try creating a backing task on backend; continue even if it fails (local-only event)
    let createdTaskId = null;
    try {
      const taskPayload = {
        title: routineEventName.trim(),
        description: "",
        tags: [],
        priority: "Medium",
        status: "Due",
        dueDate: new Date().toISOString(),
      };
      const res = await api.post("/tasks", taskPayload);
      createdTaskId = res.data.newTask?._id || null;
    } catch (err) {
      // ignore, task creation optional for now
      console.warn("create task failed", err?.response?.data || err.message);
    }

    const newEvents = selectedDays.map((day) => ({
      id: editingEventId || (crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`),
      taskId: createdTaskId,
      title: routineEventName.trim(),
      day,
      startTime: start,
      duration,
      color: eventColor || colorFromKey(routineEventName),
    }));

    setScheduledTasks((prev) => {
      if (editingEventId) {
        // replace only the first occurrence
        return prev.map((p) => (p.id === editingEventId ? newEvents[0] : p));
      }
      return [...prev, ...newEvents];
    });

    setIsRoutineEventModalOpen(false);
    resetRoutineEventForm();
  };

  const removeScheduledTask = (eventId) => {
    setScheduledTasks((prev) => prev.filter((event) => event.id !== eventId));
  };

  const duplicateScheduledTask = (eventId) => {
    const source = scheduledTasks.find((event) => event.id === eventId);
    if (!source) return;

    const proposedStart = Math.min(source.startTime + 60, END_MINUTES - source.duration);
    const duplicate = {
      ...source,
      id: crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`,
      startTime: proposedStart,
    };

    setScheduledTasks((prev) => [...prev, duplicate]);
  };

  useEffect(() => {
    const draft = safeReadDraft();
    if (draft) {
      if (Array.isArray(draft.scheduledTasks)) setScheduledTasks(draft.scheduledTasks);
      if (typeof draft.routineName === "string") setRoutineName(draft.routineName);
      if (typeof draft.description === "string") setDescription(draft.description);
    }
    setIsDraftHydrated(true);
  }, []);

  useEffect(() => {
    if (!isDraftHydrated) return;
    safeWriteDraft({
      scheduledTasks,
      routineName,
      description,
    });
  }, [scheduledTasks, routineName, description, isDraftHydrated]);

  // Removed task-dependent effect; routine events are now free-text and multi-day

  return (
      <div className="app-bg min-h-screen px-6 py-8 pb-40">

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in delay-100">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-1 rounded-lg p-2 border border-soft text-muted
                         hover:bg-white transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-main">
                Routine Builder
              </h1>
              <p className="mt-1 text-muted">Design your week</p>
            </div>
          </div>
          <button
            onClick={exportToImage}
            className="btn btn-primary flex items-center gap-2 cursor-pointer hover-lift"
          >
            <Download size={16} />
            Export as PNG
          </button>
        </header>

        <div className="mb-6 flex flex-wrap gap-3 animate-in delay-150">
          <button
            onClick={openRoutineEventModal}
            className="btn btn-primary flex items-center gap-2 cursor-pointer hover-lift"
          >
            <Plus size={16} />
            Add Routine Event
          </button>
          <button
            onClick={openSaveRoutineModal}
            className="btn btn-muted flex items-center gap-2 cursor-pointer hover-lift"
          >
            <Save size={16} />
            Save Weekly Routine
          </button>
        </div>

        {/* Main Layout */}
        <div className="animate-in delay-200">
          <section>
            <WeeklyGrid
              scheduledTasks={scheduledTasks}
              onAddRoutine={openRoutineEventModal}
              onEditTask={openEditRoutineEventModal}
              onDeleteTask={removeScheduledTask}
              onDuplicateTask={duplicateScheduledTask}
              innerRef={gridRef}
            />
          </section>
        </div>

        {/* Task Form Modal */}
        {isModalOpen && (
          <TaskFormModal
            task={null}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}

        {/* Save Routine Modal */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
            <div className="card card-primary w-full max-w-md animate-in delay-100">
              <h3 className="text-lg font-semibold text-main mb-2">
                Save Weekly Routine
              </h3>

              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Routine name"
                className="w-full mb-4 rounded-xl border-soft px-3 py-2 text-sm
                           focus:outline-none bg-transparent text-main"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows="3"
                className="w-full mb-4 rounded-lg border-soft px-3 py-2 text-sm
                           focus:ring-primary bg-transparent text-main resize-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-muted"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary cursor-pointer"
                  onClick={confirmSaveRoutine}
                  disabled={!routineName.trim()}
                >
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Routine Event Modal */}
        {isRoutineEventModalOpen && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in px-4">
            <div className="card card-primary w-full max-w-lg animate-in delay-100">
              <h3 className="text-lg font-semibold text-main mb-4">
                {editingEventId ? "Edit Routine Event" : "Add Routine Event"}
              </h3>

              <form onSubmit={handleSubmitRoutineEvent} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-main">Routine name</label>
                  <input
                    type="text"
                    value={routineEventName}
                    onChange={(e) => setRoutineEventName(e.target.value)}
                    placeholder="e.g. Morning Workout"
                    className="w-full mt-1 rounded-lg border-soft px-3 py-2 text-sm bg-transparent text-main"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-main">Days</label>
                  <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDays((s) => [...s, day]);
                            else setSelectedDays((s) => s.filter((d) => d !== day));
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-main">Start Time</label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      min="06:00"
                      max="22:00"
                      step="300"
                      className="w-full mt-1 rounded-lg border-soft px-3 py-2 text-sm bg-transparent text-main"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-main">End Time</label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      min="06:00"
                      max="22:00"
                      step="300"
                      className="w-full mt-1 rounded-lg border-soft px-3 py-2 text-sm bg-transparent text-main"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-main">Color</label>
                  <input
                    type="color"
                    value={eventColor}
                    onChange={(e) => setEventColor(e.target.value)}
                    className="w-16 h-10 mt-1 rounded-lg border-soft p-1"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-muted"
                    onClick={() => {
                      setIsRoutineEventModalOpen(false);
                      resetRoutineEventForm();
                    }}
                  >
                    Cancel
                  </button>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary cursor-pointer"
                      disabled={!routineEventName.trim() || selectedDays.length === 0}
                    >
                      {editingEventId ? "Update Event" : "Add Event"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
  );
}