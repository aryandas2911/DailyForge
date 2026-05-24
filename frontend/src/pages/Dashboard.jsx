import OnboardingModal from "../components/OnboardingModal";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, Flame, ArrowRight, RotateCw, Copy } from "lucide-react";
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
  const [duplicateTargetDay, setDuplicateTargetDay] = useState(DAYS_OF_WEEK[0]);

  const { tasks, updateTask: updateDbTask } = useTasks();
  const { updateTask, routineTasks } = useMixedTasks(updateDbTask);

  const today = new Date();
 

  //quotes array and random selection
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

  const [mood, setMood] = useState("normal");
  const moodOptions = [
    { id: "normal", label: "Normal", emoji: "🙂" },
    { id: "tired", label: "Tired", emoji: "😴" },
    { id: "focused", label: "Focused", emoji: "🔥" },
    { id: "relaxed", label: "Relaxed", emoji: "🧘" },
  ];

  const moodMessages = {
    normal: "Showing all tasks so you can keep your flow.",
    tired: "You’re tired — only easy tasks are shown.",
    focused: "You’re focused — high-priority work is ready.",
    relaxed: "Take it easy — moderate tasks are recommended.",
  };

  const moodFilter = (task) => {
    if (!task) return false;
    if (mood === "tired") return task.priority === "Low";
    if (mood === "focused") return task.priority === "High";
    if (mood === "relaxed") return task.priority !== "High";
    return true;
  };

  const combinedTasks = [...tasks, ...routineTasks];
  const moodFilteredTasks = combinedTasks.filter(moodFilter);

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

  // Fetch routines
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

    // Optimistic UI update
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
  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-6 py-8 space-y-8 animate-in">
      <OnboardingModal />
      {/* Header */}
      <header className="animate-in flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 shadow-md rounded-xl bg-(--surface) gap-4">
        {/* Display time */}
       <div className="w-full">
  <h1 className="text-2xl font-semibold text-main leading-tight">
    {getGreeting()}, {user?.name}
  </h1>

  <p className="text-sm italic text-primary mt-2">
    "{quote}"
  </p>

  <div className="flex justify-between items-center mt-1 w-full">
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
</div>
      </header>

      {/* Mood Selector */}
      <section className="card animate-in delay-150 p-4 shadow-sm bg-white/80 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-main">Pick a mood</h2>
            <p className="text-sm text-muted mt-1">Select how you feel and DailyForge will highlight the best tasks for you.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMood(option.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  mood === option.id
                    ? "bg-(--primary) text-white shadow-sm"
                    : "bg-slate-100 text-main hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="mr-2">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted mt-4">{moodMessages[mood]}</p>
      </section>

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
          tasks={moodFilteredTasks}
          mood={mood}
          updateTask={updateTask}
        />
      </div>

      {/* Bottom Row: TaskPreview + Routines */}
      <section className="flex animate-in delay-200 flex-col lg:flex-row gap-6 w-full">
        {/* Upcoming Tasks */}
        <div className="flex-1 animate-in delay-300">
          <TaskPreview
            tasks={upcomingTasks.filter(moodFilter)}
            mood={mood}
            updateTask={updateTask}
          />
        </div>

        {/* Saved Routines */}
        <div className="card flex-1 animate-in delay-300 flex flex-col h-[340px] overflow-y-auto relative">
          {/* Header with button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-main">Saved Routines</h2>
            <button                                                              
                onClick={fetchRoutines}                                            
                disabled={loadingRoutines}                                        
                aria-label="Refresh routines"                                     
                className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer disabled:opacity-50" 
              >                                                                   
                <RotateCw                                                          
                  size={15}                                                        
                  className={`text-muted ${loadingRoutines ? "animate-spin" : ""}`} 
                />                                                                
              </button>                                                           
            </div>                                                               
            <button
              className="group flex gap-2 self-center px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
              onClick={() => navigate("/routine-builder")}
            >
              Build
              <ArrowRight className="transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>

          {loadingRoutines ? (
            <p className="text-sm text-muted">Loading routines…</p>
          ) : savedRoutines.length === 0 ? (
            <p className="text-sm text-muted text-center mt-10">
              No routines saved yet
            </p>
          ) : (
            <ul className="space-y-3">
              {savedRoutines.map((routine) => (
                <li
                  key={routine._id}
                  onClick={() => navigate("/routine-builder")}
                  className="border-l-4 border-primary rounded-xl p-4 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 animate-in cursor-pointer hover-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-main">{routine.name}</p>
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
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 italic">
                      {routine.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted/80 mt-1 uppercase tracking-wider">
                    {routine.items.length} tasks across{" "}
                    {new Set(routine.items.map((i) => i.day)).size} day(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

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
