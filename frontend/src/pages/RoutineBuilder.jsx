import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("22:00");
  const [interval, setInterval] = useState(60);

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
        duration: task.endTime ? task.endTime - task.startTime : task.duration,
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

  /* Update task endTime */
  const updateTaskEndTime = (taskId, day, newEndTime) => {
    setScheduledTasks((prev) =>
      prev.map((t) =>
        t.taskId === taskId && t.day === day
          ? { ...t, endTime: newEndTime }
          : t
      )
    );
  };

  /* ---------------- DRAG END HANDLER ---------------- */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const task = active.data.current?.task;
    if (!task) return;
    const { day, startTime } = over.data.current;

    // Calculate endTime as startTime + 60 minutes (1 hour default)
    const endTime = startTime + 60;

    setScheduledTasks((prev) => [
      ...prev.filter((t) => !(t.taskId === task._id && t.day === day)),
      {
        taskId: task._id,
        title: task.title,
        day,
        startTime,
        endTime,
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
            {/* Time Controls */}
            <div className="card card-primary mb-6 p-4">
              <h3 className="text-sm font-semibold text-main mb-4">Schedule Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-xs font-medium text-main mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-xs font-medium text-main mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Interval */}
                <div>
                  <label className="block text-xs font-medium text-main mb-2">
                    Interval
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full rounded-lg border border-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 mins</option>
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            </div>

            <WeeklyGrid
              scheduledTasks={scheduledTasks}
              onSaveDay={openSaveRoutineModal}
              startTime={startTime}
              endTime={endTime}
              interval={interval}
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
          <div className="card card-primary w-full max-w-md max-h-[90vh] overflow-y-auto animate-in delay-100">
            <h3 className="text-lg font-semibold text-main mb-4">
              Save {selectedDay} Routine
            </h3>

            {/* Task Duration Editor */}
            <div className="mb-4 pb-4 border-b border-soft">
              <h4 className="text-xs font-semibold text-main mb-3 uppercase tracking-wide">
                Adjust Task Durations
              </h4>
              {scheduledTasks
                .filter((t) => t.day === selectedDay)
                .sort((a, b) => a.startTime - b.startTime)
                .map((task) => {
                  const startHours = String(Math.floor(task.startTime / 60)).padStart(2, "0");
                  const startMins = String(task.startTime % 60).padStart(2, "0");
                  const endHours = String(Math.floor(task.endTime / 60)).padStart(2, "0");
                  const endMins = String(task.endTime % 60).padStart(2, "0");
                  const duration = task.endTime - task.startTime;

                  return (
                    <div key={task.taskId} className="mb-3 p-3 rounded-lg bg-white/50">
                      <p className="text-sm font-medium text-main mb-2">{task.title}</p>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-muted min-w-fit">
                          {startHours}:{startMins} →
                        </span>
                        <input
                          type="time"
                          value={`${endHours}:${endMins}`}
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(":").map(Number);
                            updateTaskEndTime(task.taskId, selectedDay, h * 60 + m);
                          }}
                          className="flex-1 rounded-lg border border-soft px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-muted min-w-fit">
                          ({duration}m)
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

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
