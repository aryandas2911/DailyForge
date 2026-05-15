import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios.js";

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
    <DndContext onDragEnd={handleDragEnd}>
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
          ) : Array.isArray(savedRoutines) && savedRoutines.length === 0 ? (
            <div className="card card-muted text-sm text-muted text-center py-8">
              No routines saved yet
            </div>
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
                    className="card card-primary hover:shadow-md transition p-4"
                  >
                    <h3 className="font-medium text-main mb-2">
                      {routine.name}
                    </h3>

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

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in">
          <div className="card card-primary w-full max-w-md animate-in delay-100">
            <h3 className="text-lg font-semibold text-main mb-2">
              Save {selectedDay} Routine
            </h3>

            <input
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Routine name"
              className="w-full mb-4 rounded-xl border-soft px-3 py-2 text-sm focus:outline-none"
            />

            <textarea
              value={description}
              onChange={(e)=> setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows="3"
              className="w-full mb-4 rounded-lg border-soft px-3 py-2 text-sm focus:ring-primary bg-white resize-none"
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
