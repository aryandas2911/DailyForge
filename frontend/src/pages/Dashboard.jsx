import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, ArrowRight, Copy } from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";

import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import api from "../api/axios.js";
import useTasks from "../hooks/useTasks.js";
import { getGreeting } from "../utils/getGreeting";
import { DAYS_OF_WEEK } from "../utils/constants";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [routineTasks, setRoutineTasks] = useState([]);
  const [duplicatingRoutineId, setDuplicatingRoutineId] = useState(null);
  const [routineToDuplicate, setRoutineToDuplicate] = useState(null);
  const [duplicateTargetDay, setDuplicateTargetDay] = useState(DAYS_OF_WEEK[0]);

  const { tasks, updateTask } = useTasks();

  const today = new Date();

  const motivationalQuotes = [
    "Win the morning, win the day.",
    "Small progress is still progress.",
    "Discipline beats motivation.",
    "Push yourself, because no one else will.",
    "Stay consistent and trust the process.",
  ];

  const [quote] = useState(() => {
    return motivationalQuotes[
      Math.floor(Math.random() * motivationalQuotes.length)
    ];
  });

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    return today.toDateString() === due.toDateString();
  });

  const completedToday = todayTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const totalToday = todayTasks.length;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weekTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    return due >= startOfWeek && due <= endOfWeek;
  });

  const completedThisWeek = weekTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const weeklyCompletionPercent = weekTasks.length
    ? Math.round((completedThisWeek / weekTasks.length) * 100)
    : 0;

  const upcomingTasks = tasks
    .filter((task) => task.status !== "Completed")
    .slice(0, 2);

  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);
      const res = await api.get("/routines");
      setSavedRoutines(res.data.routines || []);
    } catch (err) {
      console.error(err);
      setSavedRoutines([]);
    } finally {
      setLoadingRoutines(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  useEffect(() => {
    const loadRoutineTasks = () => {
      const storedRoutineTasks = localStorage.getItem("activeRoutineTasks");
      if (storedRoutineTasks) {
        setRoutineTasks(JSON.parse(storedRoutineTasks));
      } else {
        setRoutineTasks([]);
      }
    };

    loadRoutineTasks();
    window.addEventListener("storage", loadRoutineTasks);
    return () => {
      window.removeEventListener("storage", loadRoutineTasks);
    };
  }, []);

  const openDuplicateModal = (routine) => {
    setRoutineToDuplicate(routine);
    setDuplicateTargetDay(routine.items[0]?.day || DAYS_OF_WEEK[0]);
  };

  const closeDuplicateModal = () => {
    setRoutineToDuplicate(null);
    setDuplicateTargetDay(DAYS_OF_WEEK[0]);
  };

  const handleDuplicateRoutine = async () => {
    if (!routineToDuplicate) return;

    try {
      setDuplicatingRoutineId(routineToDuplicate._id);

      const res = await api.post(
        `/routines/${routineToDuplicate._id}/duplicate`,
        { targetDay: duplicateTargetDay }
      );

      if (res.data.routine) {
        setSavedRoutines((prevRoutines) => [
          res.data.routine,
          ...prevRoutines,
        ]);
      } else {
        await fetchRoutines();
      }

      closeDuplicateModal();
    } catch (err) {
      console.error(err);
      alert("Failed to duplicate routine");
    } finally {
      setDuplicatingRoutineId(null);
    }
  };

  const todayProgress = totalToday > 0
    ? Math.round((completedToday / totalToday) * 100)
    : 0;

  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-6 py-8 space-y-8 animate-in">

      {/* Greeting Card — interactive */}
      <header className="greeting-card animate-in flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-4">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-main leading-tight">
            {getGreeting()}, {user?.name}
          </h1>

          {/* Quote with animated left-border accent */}
          <p className="quote-highlight text-sm italic text-primary mt-3 pl-3">
            "{quote}"
          </p>

          <div className="flex justify-between items-center mt-2 w-full">
            <p className="text-sm text-muted">
              {new Date()
                .toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                })
                .replace(",", " ·")}
            </p>
            <LiveClock />
          </div>

          {/* Today's progress bar */}
          {totalToday > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted">Today's progress</span>
                <span className="text-xs font-medium text-primary">
                  {completedToday}/{totalToday} tasks
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stats Row */}
      <section className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex-1 animate-in delay-100">
          <StatCard
            label="Today"
            value={`${completedToday} / ${totalToday}`}
            subtitle="Tasks done"
            icon={<CheckCircle2 size={20} />}
          />
        </div>
        <div className="flex-1 animate-in delay-200">
          <StatCard
            label="This Week"
            value={`${weeklyCompletionPercent}%`}
            subtitle="Completion"
            icon={<Calendar size={20} />}
          />
        </div>
      </section>

      {/* Today's Tasks */}
      <div className="w-full animate-in delay-200">
        <DashboardTasks
          tasks={[...tasks, ...routineTasks]}
          updateTask={updateTask}
        />
      </div>

      {/* Bottom Row: TaskPreview + Routines */}
      <section className="flex animate-in delay-200 flex-col lg:flex-row gap-6 w-full">

        {/* Upcoming Tasks */}
        <div className="flex-1 animate-in delay-300">
          <TaskPreview tasks={upcomingTasks} updateTask={updateTask} />
        </div>

        {/* Saved Routines — interactive card */}
        <div className="routines-card card flex-1 animate-in delay-300 flex flex-col h-[340px] overflow-y-auto relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-main">Saved Routines</h2>
            <button
              className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer flex items-center gap-1 transition-all duration-200 hover:gap-2"
              onClick={() => navigate("/routine-builder")}
            >
              Build
              <ArrowRight size={16} />
            </button>
          </div>

          {loadingRoutines ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="routine-skeleton rounded-xl h-16" />
              ))}
            </div>
          ) : savedRoutines.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 mt-6">
              <p className="text-sm text-muted text-center">
                No routines saved yet
              </p>
              <button
                onClick={() => navigate("/routine-builder")}
                className="text-xs text-primary underline underline-offset-2 cursor-pointer"
              >
                Build your first routine →
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {savedRoutines.map((routine, index) => (
                <li
                  key={routine._id}
                  onClick={() => navigate("/routine-builder")}
                  className="routine-item"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  {/* Sliding accent bar on hover */}
                  <span className="routine-accent-bar" aria-hidden="true" />

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Pulse dot showing task count */}
                      <span className="routine-dot" title={`${routine.items.length} tasks`} />
                      <p className="font-medium text-main truncate">{routine.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDuplicateModal(routine);
                      }}
                      disabled={duplicatingRoutineId === routine._id}
                      aria-label={`Duplicate ${routine.name}`}
                      title="Duplicate routine"
                      className="shrink-0 rounded-lg p-2 text-muted hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  {routine.description && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 italic relative z-10">
                      {routine.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1 relative z-10">
                    <p className="text-[10px] text-muted/80 uppercase tracking-wider">
                      {routine.items.length} tasks across{" "}
                      {new Set(routine.items.map((i) => i.day)).size} day(s)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Duplicate Modal */}
      {routineToDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="card card-primary w-full max-w-sm">
            <h3 className="text-lg font-semibold text-main">
              Duplicate Routine
            </h3>
            <p className="mt-1 text-sm text-muted">
              Choose the day for "{routineToDuplicate.name} (Copy)".
            </p>

            <label className="mt-4 block text-sm font-medium text-main">
              Copy to
            </label>
            <select
              value={duplicateTargetDay}
              onChange={(e) => setDuplicateTargetDay(e.target.value)}
              className="mt-2 w-full rounded-lg border-soft bg-transparent px-3 py-2 text-sm text-main focus:outline-none"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-muted"
                onClick={closeDuplicateModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary cursor-pointer"
                onClick={handleDuplicateRoutine}
                disabled={duplicatingRoutineId === routineToDuplicate._id}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}