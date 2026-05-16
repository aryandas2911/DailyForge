import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import api from "../api/axios.js";
import EmptyState from "../components/EmptyState";

export default function RoutineBuilder() {
  const { addTask, tasks } = useTasks();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [description, setDescription] = useState("");
  const [editingRoutineId, setEditingRoutineId] = useState(null);

  // Configure sensors for drag-and-drop (mouse + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleSubmit = async (data) => {
    try {
      await addTask({ ...data, status: "Due" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);
      const res = await api.get("/routines");
      // res.data.routines is the array you need
      setSavedRoutines(
        Array.isArray(res.data.routines) ? res.data.routines : []
      );
    } catch (err) {
      console.error(err);
      setSavedRoutines([]);
    } finally {
      setLoadingRoutines(false);
    }
  };

  const confirmSaveRoutine = async () => {
    const routineItems = editingRoutineId
      ? scheduledTasks
      : scheduledTasks.filter((task) => task.day === selectedDay);

    const items = routineItems.map((task) => ({
      taskId: task.taskId,
      day: task.day,
      startTime: task.startTime,
      duration: task.duration,
    }));

    try {
      const payload = {
        name: routineName,
        description: description,
        items,
      };

      if (editingRoutineId) {
        await api.put(`/routines/${editingRoutineId}`, payload);
      } else {
        await api.post("/routines", payload);
      }

      setIsSaveModalOpen(false);
      setRoutineName("");
      setDescription("");
      setSelectedDay(null);
      setEditingRoutineId(null);
      setScheduledTasks([]);

      alert(editingRoutineId ? "Routine updated successfully" : "Routine saved successfully");
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      alert(editingRoutineId ? "Failed to update routine" : "Failed to save routine");
    }
  };

  const openSaveRoutineModal = (day) => {
    const hasTasks = scheduledTasks.some((t) => t.day === day);
    if (!hasTasks) {
      alert(`No tasks scheduled for ${day}`);
      return;
    }

    setSelectedDay(day);
    setRoutineName(`${day} Routine`);
    setIsSaveModalOpen(true);
  };

  const handleUpdateScheduledTask = (taskId, day, updates) => {
    setScheduledTasks((prev) =>
      prev.map((task) =>
        task.taskId === taskId && task.day === day
          ? {
              ...task,
              ...updates,
              duration: Math.max(10, updates.duration || task.duration),
            }
          : task
      )
    );
  };

  const handleDeleteScheduledTask = (taskId, day) => {
    setScheduledTasks((prev) =>
      prev.filter((task) => !(task.taskId === taskId && task.day === day))
    );
  };

  const handleLoadRoutine = (routine) => {
    const loadedTasks = routine.items.map((item) => {
      const taskId = typeof item.taskId === "object" ? item.taskId._id : item.taskId;
      const taskInfo = tasks.find((task) => task._id === taskId);

      return {
        taskId,
        title: taskInfo?.title || "Unknown Task",
        day: item.day,
        startTime: item.startTime,
        duration: item.duration,
      };
    });

    setScheduledTasks(loadedTasks);
    setEditingRoutineId(routine._id);
    setRoutineName(routine.name);
    setDescription(routine.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRoutine = async (routineId) => {
    const confirmed = window.confirm("Delete this routine?");
    if (!confirmed) return;

    try {
      await api.delete(`/routines/${routineId}`);
      if (editingRoutineId === routineId) {
        setEditingRoutineId(null);
        setRoutineName("");
        setDescription("");
        setScheduledTasks([]);
      }
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      alert("Failed to delete routine");
    }
  };

  /* ---------------- DRAG END HANDLER ---------------- */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const task = active.data.current?.task;
    if (!task) return;
    const { day, startTime } = over.data.current;

    setScheduledTasks((prev) => [
      ...prev.filter((t) => !(t.taskId === task._id && t.day === day)),
      {
        taskId: task._id,
        title: task.title,
        day,
        startTime,
        duration: 60,
      },
    ]);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="ios-glass-theme app-bg min-h-screen px-6 py-8 animate-in">
        {/* Header */}
        <header className="glass-panel mb-8 flex flex-col gap-4 rounded-2xl p-5 animate-in delay-100 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-1 rounded-lg p-2 border border-white/70 text-muted hover:bg-white/60 transition cursor-pointer"
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

          {editingRoutineId && (
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-primary gap-2 cursor-pointer"
                onClick={() => {
                  setSelectedDay(null);
                  setIsSaveModalOpen(true);
                }}
              >
                <Pencil size={16} />
                Update Routine
              </button>
              <button
                className="btn glass-pill text-main gap-2 cursor-pointer"
                onClick={() => {
                  setEditingRoutineId(null);
                  setRoutineName("");
                  setDescription("");
                  setScheduledTasks([]);
                }}
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>
          )}
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6 animate-in delay-200">
          <aside className="col-span-12 md:col-span-3">
            <TaskLibrary onAddTask={() => setIsModalOpen(true)} />
          </aside>

          <section className="col-span-12 md:col-span-9">
            <WeeklyGrid
              scheduledTasks={scheduledTasks}
              onSaveDay={openSaveRoutineModal}
              onUpdateTask={handleUpdateScheduledTask}
              onDeleteTask={handleDeleteScheduledTask}
            />
          </section>
        </div>

        {/* ================= Saved Routines ================= */}
        <section className="mt-10 animate-in delay-300">
          <h2 className="text-xl font-semibold text-main mb-4">
            Saved Routines
          </h2>

          {loadingRoutines ? (
            <p className="text-sm text-muted">Loading routines…</p>
          ) : savedRoutines.length === 0 ? (
  <EmptyState type="routines" onAction={() => setIsModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoutines.map((routine) => {
                // Group tasks by day
                const tasksByDay = routine.items.reduce((acc, item) => {
                  if (!acc[item.day]) acc[item.day] = [];

                  // Find the full task info by taskId
                  const taskInfo = tasks.find((t) => t._id === item.taskId);

                  acc[item.day].push({
                    ...item,
                    title: taskInfo?.title || "Unknown Task",
                  });

                  return acc;
                }, {});

                return (
                  <div
                    key={routine._id}
                    className="card card-primary glass-panel hover:shadow-md transition p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="font-medium text-main">
                        {routine.name}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          className="icon-btn text-main hover:bg-white/60"
                          onClick={() => handleLoadRoutine(routine)}
                          aria-label={`Edit ${routine.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteRoutine(routine._id)}
                          aria-label={`Delete ${routine.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {routine.description && (
                      <p className="text-xs text-muted mb-3 italic">
                        {routine.description}
                      </p>
                    )}

                    {Object.keys(tasksByDay).map((day) => (
                      <div key={day} className="mb-2">
                        <p className="text-sm font-semibold text-main">{day}</p>
                        <ul className="text-xs text-muted ml-3">
                          {tasksByDay[day]
                            .sort((a, b) => a.startTime - b.startTime)
                            .map((task) => {
                              const hours = String(
                                Math.floor(task.startTime / 60)
                              ).padStart(2, "0");
                              const minutes = String(
                                task.startTime % 60
                              ).padStart(2, "0");
                              return (
                                <li key={`${task.taskId}-${task.startTime}`}>
                                  {hours}:{minutes} – {task.title}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {isModalOpen && (
          <TaskFormModal
            task={null}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
          <div className="card card-primary glass-panel w-full max-w-md animate-in delay-100">
            <h3 className="text-lg font-semibold text-main mb-2">
              {editingRoutineId ? "Update Routine" : `Save ${selectedDay} Routine`}
            </h3>

            <input
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Routine name"
              className="w-full mb-4 rounded-xl border border-white/70 bg-white/55 px-3 py-2 text-sm focus:outline-none"
            />

            <textarea
              value={description}
              onChange={(e)=> setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows="3"
              className="w-full mb-4 rounded-lg border border-white/70 bg-white/55 px-3 py-2 text-sm focus:ring-primary resize-none"
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
    </DndContext>
  );
}
