import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import RoutineCard from "../components/Routine/RoutineCard.jsx";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios.js";
import EmptyState from "../components/EmptyState";
import { useScrollThenOpen } from "../hooks/useScrollThenOpen.js";

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
  const [activeRoutine, setActiveRoutine] = useState([]);
  const [description, setDescription] = useState("");
  const [activeTask, setActiveTask] = useState(null);

  const normalizeDay = (day) => String(day || "").trim().toLowerCase();

  // Configure sensors for drag-and-drop (mouse + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Modal open/close
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleOpenModal = useScrollThenOpen(openModal, 0);

  const handleSubmit = async (data) => {
    try {
      await addTask({ ...data, status: "Due" });
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  useEffect(() => {

  if (!savedRoutines.length) return;

  const storedRoutineIds = JSON.parse(
    localStorage.getItem("activeRoutineIds") || "[]"
  );

  if (!storedRoutineIds.length) return;

  const restoredRoutines = savedRoutines.filter(
    (routine) =>
      storedRoutineIds.includes(routine._id)
  );

  setActiveRoutine(restoredRoutines);

  }, [savedRoutines]);

  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);
      const res = await api.get("/routines");
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
        description,
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
      const errorMessage = err.response?.data?.message || "Failed to save routine";
      alert(errorMessage);
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

  /* ---------------- DRAG HANDLERS ---------------- */
  const handleDragStart = (event) => {
    setActiveDragTask(event.active.data.current?.task ?? null);
  /* ---------------- DRAG END HANDLER ---------------- */
  // Removing Schedule task after drag
  const removeScheduledTask = (taskId, day) => {

    //filtering out 
    setScheduledTasks((prev) =>
      prev.filter(
        (task) =>
          !(
            task.taskId === taskId &&
            normalizeDay(task.day) === normalizeDay(day)
          )
      )
    );
  };

  const handleDragEnd = (event) => {
    setActiveDragTask(null);
    const { active, over } = event;
    if (!over) return;
    const task = active.data.current?.task;
    if (!task) return;
    const { day, startTime } = over.data.current;

    setScheduledTasks((prev) => [
      ...prev.filter((t) => !(t.taskId === task._id && t.day === day)),
      { taskId: task._id, title: task.title, day, startTime, duration: 60 },
    ]);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="app-bg min-h-screen px-6 py-8 animate-in">
    <DndContext
      sensors={sensors}
      onDragStart={(event) => setActiveTask(event.active.data.current?.task)}
      onDragEnd={(event) => {
        setActiveTask(null);
        handleDragEnd(event);
      }}
    >
      <div className="app-bg min-h-screen px-6 py-8 pb-40">

        {/* Header */}
        <header className="mb-8 flex items-start gap-4 animate-in delay-100">
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
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6 animate-in delay-200">
          <aside className="col-span-12 md:col-span-3 md:sticky md:top-6 md:self-start">
            <TaskLibrary onAddTask={() => setIsModalOpen(true)} />
          <aside className="col-span-12 md:col-span-3">
            <TaskLibrary
  tasks={tasks}
  onAddTask={() => setIsModalOpen(true)}
/>
            {/*
             * TaskLibrary's "Add Task" button opens the modal directly
             * (user is already at the top section of the page, no scroll needed).
             * Use openModal instead of handleOpenModal here.
             */}
            <TaskLibrary onAddTask={openModal} />
          </aside>

          <section className="col-span-12 md:col-span-9">
            <WeeklyGrid
              scheduledTasks={scheduledTasks}
              onSaveDay={openSaveRoutineModal}
              onDeleteTask={removeScheduledTask}
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
            /*
             * EmptyState is deep in the page — clicking "Create Your First
             * Routine" here triggers handleOpenModal, which scrolls to the
             * top first, then opens the modal once the scroll settles.
             */
            <EmptyState
              type="routines"
              onAction={handleOpenModal}
            />
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

                const allTasks = Object.values(tasksByDay)
                  .flat()
                  .sort((a, b) => a.startTime - b.startTime);

                return (
                  <div
                    key={routine._id}
                    className="card card-primary hover:shadow-lg transition-all p-5"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-main text-sm leading-snug truncate">
                          {routine.name}
                        </h3>
                        {routine.description && (
                          <p className="text-xs text-muted mt-0.5 italic line-clamp-1">
                            {routine.description}
                          </p>
                        )}
                      </div>
                      <span className="ml-2 shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d0f6e3] text-[#3b8ea0]">
                        {allTasks.length} task{allTasks.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Task list — no day heading (already in routine name) */}
                    <div className="space-y-1.5">
                      {allTasks.map((task) => {
                        const hours = String(
                          Math.floor(task.startTime / 60)
                        ).padStart(2, "0");
                        const minutes = String(
                          task.startTime % 60
                        ).padStart(2, "0");
                        return (
                          <div
                            key={task._id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="font-mono font-semibold text-[#4eb7b3] shrink-0 w-10">
                              {hours}:{minutes}
                            </span>
                            <span className="w-px h-3 bg-[#98e1d7] shrink-0" />
                            <span className="text-main truncate">{task.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {savedRoutines.map((routine) => (
                <RoutineCard
                  key={routine._id}
                  routine={routine}
                  tasks={tasks}
                  activeRoutine={activeRoutine}
                  setActiveRoutine={setActiveRoutine}
                  fetchRoutines={fetchRoutines}
                />
              ))}
            </div>
          )}
        </section>

        {/* Task Form Modal */}
        {isModalOpen && (
          <TaskFormModal
            task={null}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}

      {/* ===== Drag Overlay (floating card while dragging) ===== */}
      <DragOverlay dropAnimation={null}>
        {activeDragTask && (
          <div className="flex items-center gap-2 rounded-xl border-soft bg-white p-3 shadow-xl w-52 cursor-grabbing opacity-95">
            <GripVertical size={14} className="shrink-0 text-muted opacity-40" />
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor:
                  activeDragTask.priority === "High"
                    ? "#ef4444"
                    : activeDragTask.priority === "Medium"
                    ? "#f59e0b"
                    : "#10b981",
              }}
            />
            <p className="flex-1 text-sm font-medium text-main truncate">
              {activeDragTask.title}
            </p>
          </div>
        )}
      </DragOverlay>

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
        {/* Save Routine Modal */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
            <div className="card card-primary w-full max-w-md animate-in delay-100">
              <h3 className="text-lg font-semibold text-main mb-2">
                Save {selectedDay} Routine
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

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="rounded-xl bg-white p-3 shadow-xl border border-gray-200">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}