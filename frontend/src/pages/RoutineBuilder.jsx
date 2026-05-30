import { useEffect, useState, useCallback, useRef } from "react";
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
import RoutineCard from "../components/Routine/RoutineCard.jsx";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { toPng } from "html-to-image";
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
      const res = await api.post("/routines", {
        name: routineName,
        description,
        items,
      });

      const createdRoutine = res.data.routine || res.data.routines?.[0];
      if (createdRoutine) {
        setSavedRoutines((prevRoutines) => [
          createdRoutine,
          ...prevRoutines.filter((routine) => routine._id !== createdRoutine._id),
        ]);
      }

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

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6 animate-in delay-200">
          <aside className="col-span-12 md:col-span-3">
            {/*
             * TaskLibrary's "Add Task" button opens the modal directly
             * (user is already at the top section of the page, no scroll needed).
             * Use openModal instead of handleOpenModal here.
             */}
            <TaskLibrary
              tasks={tasks}
              onAddTask={openModal}
            />
          </aside>

          <section className="col-span-12 md:col-span-9">
            <WeeklyGrid
              scheduledTasks={scheduledTasks}
              onSaveDay={openSaveRoutineModal}
              onDeleteTask={removeScheduledTask}
              innerRef={gridRef}
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
                           focus:ring-primary dark:focus:ring-primary bg-transparent text-main dark:text-white resize-none"
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