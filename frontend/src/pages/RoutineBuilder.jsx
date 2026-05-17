import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
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
import { ArrowLeft, Trash2, Edit2 } from "lucide-react";
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
  const [activeTask, setActiveTask] = useState(null);

  // Configure sensors for drag-and-drop (mouse + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [editingRoutine, setEditingRoutine] = useState(null);
  const [editRoutineName, setEditRoutineName] = useState("");
  const [editRoutineDesc, setEditRoutineDesc] = useState("");
  const [routineToDelete, setRoutineToDelete] = useState(null);

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

  useEffect(() => {
    // Hydrate the weekly grid with existing routines if the grid is empty
    if (savedRoutines.length > 0 && tasks.length > 0 && scheduledTasks.length === 0) {
      const allScheduled = [];
      savedRoutines.forEach(routine => {
        routine.items.forEach(item => {
          const taskInfo = tasks.find(t => t._id === item.taskId);
          allScheduled.push({
            taskId: item.taskId,
            title: taskInfo?.title || "Unknown Task",
            day: item.day,
            startTime: item.startTime,
            duration: item.duration || 60,
          });
        });
      });
      setScheduledTasks(allScheduled);
    }
  }, [savedRoutines, tasks]);

  const confirmDeleteRoutine = async () => {
    try {
      await api.delete(`/routines/${routineToDelete}`);
      setRoutineToDelete(null);
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      alert("Failed to delete routine");
    }
  };

  const openEditModal = (routine) => {
    setEditingRoutine(routine);
    setEditRoutineName(routine.name);
    setEditRoutineDesc(routine.description || "");
  };

  const confirmEditRoutine = async () => {
    try {
      await api.put(`/routines/${editingRoutine._id}`, {
        name: editRoutineName,
        description: editRoutineDesc,
      });
      setEditingRoutine(null);
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      alert("Failed to update routine");
    }
  };

  const confirmSaveRoutine = async () => {
    const items = scheduledTasks
      .filter((task) => task.day === selectedDay)
      .map((task) => ({
        taskId: task.taskId,
        day: selectedDay,
        startTime: task.startTime,
        duration: task.duration,
      }));

    try {
      await api.post("/routines", {
        name: routineName,
        description: description,
        items,
      });

      setIsSaveModalOpen(false);
      setRoutineName("");
      setDescription("");
      setSelectedDay(null);

      alert("Routine saved successfully");
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      alert("Failed to save routine");
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

  /* ---------------- DRAG END HANDLER ---------------- */

  // Removing Schedule task after drag
  const removeScheduledTask = (taskId , day) => {

    //filtering out 
    setScheduledTasks((prevTasks) => 
      prevTasks.filter((task) => {
        return !(task.taskId === taskId && task.day === day);
      })
    );
  };


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
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        setActiveTask(event.active.data.current?.task);
      }}
      onDragEnd={(event) => {
        setActiveTask(null);
        handleDragEnd(event);
      }}
    >
      <div className="app-bg min-h-screen px-6 py-8 animate-in">
        {/* Header */}
        <header className="mb-8 flex items-start gap-4 animate-in delay-100">
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-1 rounded-lg p-2 border border-soft text-muted hover:bg-white transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1 className="text-3xl font-semibold text-main">
              Routine Builder
            </h1>
            <p className="mt-1 text-muted">Design your week</p>
          </div>
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
              onDeleteTask={removeScheduledTask} //Passing Removing function to weeklygrid
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
                    className="card card-primary hover:shadow-md transition p-4 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-main">
                        {routine.name}
                      </h3>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(routine); }} className="text-muted hover:text-primary transition cursor-pointer" title="Edit Routine">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRoutineToDelete(routine._id); }} className="text-muted hover:text-red-500 transition cursor-pointer" title="Delete Routine">
                          <Trash2 size={16} />
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
                                <li key={task._id}>
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

      {isSaveModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] animate-in">
          <div className="card card-primary w-full max-w-md animate-in delay-100">
            <h3 className="text-lg font-semibold text-main mb-2">
              Save {selectedDay} Routine
            </h3>

            <input
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Routine name"
              className="w-full mb-4 rounded-xl border-soft px-3 py-2 text-sm focus:outline-none bg-transparent text-main"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows="3"
              className="w-full mb-4 rounded-lg border-soft px-3 py-2 text-sm focus:ring-primary bg-transparent text-main resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-muted cursor-pointer"
                onClick={() => setIsSaveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary cursor-pointer"
                onClick={confirmSaveRoutine}
                disabled={!routineName.trim()}
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {editingRoutine && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] animate-in">
          <div className="card card-primary w-full max-w-md animate-in delay-100">
            <h3 className="text-lg font-semibold text-main mb-4">
              Edit Routine
            </h3>

            <input
              type="text"
              value={editRoutineName}
              onChange={(e) => setEditRoutineName(e.target.value)}
              placeholder="Routine name"
              className="w-full mb-4 rounded-xl border-soft px-3 py-2 text-sm focus:outline-none"
            />

            <textarea
              value={editRoutineDesc}
              onChange={(e) => setEditRoutineDesc(e.target.value)}
              placeholder="Add a description (optional)"
              rows="3"
              className="w-full mb-4 rounded-lg border-soft px-3 py-2 text-sm focus:ring-primary bg-white resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-muted cursor-pointer"
                onClick={() => setEditingRoutine(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary cursor-pointer"
                onClick={confirmEditRoutine}
                disabled={!editRoutineName.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {routineToDelete && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] animate-in">
          <div className="card card-primary w-full max-w-sm animate-in delay-100 text-center p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-main mb-2">
              Delete Routine?
            </h3>
            <p className="text-sm text-muted mb-6">
              This action cannot be undone. Are you sure you want to permanently delete this routine?
            </p>

            <div className="flex justify-center gap-3 w-full">
              <button
                type="button"
                className="btn btn-muted flex-1 cursor-pointer"
                onClick={() => setRoutineToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1 cursor-pointer transition"
                onClick={confirmDeleteRoutine}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rounded-xl bg-white p-3 shadow-xl border border-gray-200">
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
