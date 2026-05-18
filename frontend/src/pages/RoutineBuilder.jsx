import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import EmptyState from "../components/EmptyState";

import useTasks from "../hooks/useTasks.js";
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
  const [activeTask, setActiveTask] = useState(null);

  /* ---------------- Motivational Quotes ---------------- */
  const quotes = [
    "Small daily habits create big results.",
    "Consistency beats intensity.",
    "Plan your week. Own your time.",
    "Discipline creates freedom.",
    "Focus on progress, not perfection.",
  ];

  const randomQuote =
    quotes[Math.floor(Math.random() * quotes.length)];

  /* ---------------- Sensors ---------------- */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  /* ---------------- Add Task ---------------- */
  const handleSubmit = async (data) => {
    try {
      await addTask({ ...data, status: "Due" });
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to add task");
    }
  };

  /* ---------------- Fetch Routines ---------------- */
  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);

      const res = await api.get("/routines");

      setSavedRoutines(
        Array.isArray(res.data.routines)
          ? res.data.routines
          : []
      );
    } catch (err) {
      setSavedRoutines([]);
    } finally {
      setLoadingRoutines(false);
    }
  };

  /* ---------------- Save Routine ---------------- */
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
      alert("Failed to save routine");
    }
  };

  /* ---------------- Open Save Modal ---------------- */
  const openSaveRoutineModal = (day) => {
    const hasTasks = scheduledTasks.some(
      (t) => t.day === day
    );

    if (!hasTasks) {
      alert(`No tasks scheduled for ${day}`);
      return;
    }

    setSelectedDay(day);
    setRoutineName(`${day} Routine`);
    setIsSaveModalOpen(true);
  };

  /* ---------------- Remove Scheduled Task ---------------- */
  const removeScheduledTask = (taskId, day) => {
    setScheduledTasks((prevTasks) =>
      prevTasks.filter(
        (task) =>
          !(task.taskId === taskId && task.day === day)
      )
    );
  };

  /* ---------------- Drag End Handler ---------------- */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const task = active.data.current?.task;

    if (!task) return;

    const { day, startTime } = over.data.current;

    setScheduledTasks((prev) => [
      ...prev.filter(
        (t) =>
          !(t.taskId === task._id && t.day === day)
      ),
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
        {/* ================= Header ================= */}
        <header className="mb-8 flex items-start gap-4 animate-in delay-100">
          <button
            onClick={() => navigate("/dashboard")}
            className="
              mt-1 rounded-lg p-2 border border-soft
              text-muted hover:bg-white dark:hover:bg-slate-800
              transition-colors cursor-pointer
            "
            aria-label="Go back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1 className="text-3xl font-semibold text-main">
              Routine Builder
            </h1>

            <p className="mt-1 text-muted">
              Design your week
            </p>

            {/* Quote Card */}
            <div
              className="
                mt-3 rounded-xl border-soft
                bg-(--surface) px-4 py-3
                text-sm text-muted italic
                animate-in
              "
            >
              “{randomQuote}”
            </div>
          </div>
        </header>

        {/* ================= Main Layout ================= */}
        <div className="grid grid-cols-12 gap-6 animate-in delay-200">
          <aside className="col-span-12 md:col-span-3">
            <TaskLibrary
              onAddTask={() => setIsModalOpen(true)}
            />
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
            <p className="text-sm text-muted">
              Loading routines…
            </p>
          ) : savedRoutines.length === 0 ? (
            <EmptyState
              type="routines"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoutines.map((routine) => {
                const tasksByDay = routine.items.reduce(
                  (acc, item) => {
                    if (!acc[item.day]) {
                      acc[item.day] = [];
                    }

                    const taskInfo = tasks.find(
                      (t) => t._id === item.taskId
                    );

                    acc[item.day].push({
                      ...item,
                      title:
                        taskInfo?.title ||
                        "Unknown Task",
                    });

                    return acc;
                  },
                  {}
                );

                return (
                  <div
                    key={routine._id}
                    className="
                      card card-primary p-4
                      hover:shadow-md transition-all
                    "
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
                        <p className="text-sm font-semibold text-main">
                          {day}
                        </p>

                        <ul className="text-xs text-muted ml-3 space-y-1">
                          {tasksByDay[day]
                            .sort(
                              (a, b) =>
                                a.startTime -
                                b.startTime
                            )
                            .map((task) => {
                              const hours = String(
                                Math.floor(
                                  task.startTime / 60
                                )
                              ).padStart(2, "0");

                              const minutes = String(
                                task.startTime % 60
                              ).padStart(2, "0");

                              return (
                                <li key={task._id}>
                                  {hours}:{minutes} –{" "}
                                  {task.title}
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

        {/* ================= Task Modal ================= */}
        {isModalOpen && (
          <TaskFormModal
            task={null}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* ================= Save Routine Modal ================= */}
      {isSaveModalOpen && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/40 backdrop-blur-sm
            flex items-center justify-center
            animate-in px-4
          "
        >
          <div className="card card-primary w-full max-w-md animate-in delay-100">
            <h3 className="text-lg font-semibold text-main mb-2">
              Save {selectedDay} Routine
            </h3>

            <input
              type="text"
              value={routineName}
              onChange={(e) =>
                setRoutineName(e.target.value)
              }
              placeholder="Routine name"
              className="
                w-full mb-4 rounded-xl border-soft
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-(--primary)
                transition-colors
                bg-transparent text-main
              "
              aria-label="Routine name"
            />

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Add a description (optional)"
              rows="3"
              className="
                w-full mb-4 rounded-lg border-soft
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-(--primary)
                transition-colors
                bg-transparent text-main resize-none
              "
              aria-label="Routine description"
            />

            <div className="flex justify-end gap-3">
              <button
                className="btn btn-muted transition-all"
                onClick={() =>
                  setIsSaveModalOpen(false)
                }
              >
                Cancel
              </button>

              <button
                className="
                  btn btn-primary cursor-pointer
                  transition-all
                "
                onClick={confirmSaveRoutine}
                disabled={!routineName.trim()}
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Drag Overlay ================= */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className="
              rounded-xl bg-(--surface)
              p-3 shadow-xl border border-soft
              text-main
            "
          >
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}