import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  RotateCw,
  Copy,
} from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";

import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import api from "../api/axios.js";
import useTasks from "../hooks/useTasks.js";
import useMixedTasks from "../hooks/useMixedTasks.js";
import { getGreeting } from "../utils/getGreeting";
import { DAYS_OF_WEEK } from "../utils/constants";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [duplicatingRoutineId, setDuplicatingRoutineId] = useState(null);
  const [routineToDuplicate, setRoutineToDuplicate] = useState(null);
  const [duplicateTargetDay, setDuplicateTargetDay] = useState(
    DAYS_OF_WEEK[0]
  );

  const { tasks, updateTask: updateDbTask } = useTasks();
  const { updateTask, routineTasks, setRoutineTasks } =
    useMixedTasks(updateDbTask);

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

  // ✅ LocalStorage sync for routine tasks (merged correctly)
  useEffect(() => {
    const loadRoutineTasks = () => {
      const storedRoutineTasks =
        localStorage.getItem("activeRoutineTasks");
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
  }, [setRoutineTasks]);

  const openDuplicateModal = (routine) => {
    setRoutineToDuplicate(routine);
    setDuplicateTargetDay(
      routine.items[0]?.day || DAYS_OF_WEEK[0]
    );
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
        setSavedRoutines((prev) => [
          res.data.routine,
          ...prev,
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

  const todayProgress =
    totalToday > 0
      ? Math.round((completedToday / totalToday) * 100)
      : 0;

  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-6 py-8 space-y-8 animate-in">
      {/* Greeting */}
      <header className="greeting-card flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-4">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-main">
            {getGreeting()}, {user?.name}
          </h1>

          <p className="quote-highlight text-sm italic text-primary mt-3 pl-3">
            "{quote}"
          </p>

          <div className="flex justify-between mt-2">
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

          {totalToday > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-1 text-xs">
                <span>Today's progress</span>
                <span>
                  {completedToday}/{totalToday}
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

      {/* Stats */}
      <section className="flex flex-col lg:flex-row gap-6">
        <StatCard
          label="Today"
          value={`${completedToday} / ${totalToday}`}
          subtitle="Tasks done"
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="This Week"
          value={`${weeklyCompletionPercent}%`}
          subtitle="Completion"
          icon={<Calendar size={20} />}
        />
      </section>

      {/* Tasks */}
      <DashboardTasks
        tasks={[...tasks, ...routineTasks]}
        updateTask={updateTask}
      />

      {/* Bottom */}
      <section className="flex flex-col lg:flex-row gap-6">
        <TaskPreview tasks={upcomingTasks} updateTask={updateTask} />

        <div className="card flex-1">
          <div className="flex justify-between mb-4">
            <h2>Saved Routines</h2>
            <button onClick={fetchRoutines}>
              <RotateCw size={16} />
            </button>
          </div>

          {savedRoutines.map((routine) => (
            <div key={routine._id}>
              <span>{routine.name}</span>
              <button onClick={() => openDuplicateModal(routine)}>
                <Copy size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {routineToDuplicate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="card">
            <h3>Duplicate Routine</h3>

            <select
              value={duplicateTargetDay}
              onChange={(e) =>
                setDuplicateTargetDay(e.target.value)
              }
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>

            <button onClick={handleDuplicateRoutine}>
              Duplicate
            </button>
            <button onClick={closeDuplicateModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}