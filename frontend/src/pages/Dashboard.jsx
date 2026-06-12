import OnboardingModal from "../components/OnboardingModal";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  CheckCircle2,
  Calendar,
  RotateCw,
  Copy,
  ArrowRight,
  X
} from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";
import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import ReflectionSummary from "../components/Dashboard/ReflectionSummary";
import ContributionHeatmap from "../components/Dashboard/ContributionHeatmap";
import api from "../api/axios.js";
import useTasks from "../hooks/useTasks.js";
import useMixedTasks from "../hooks/useMixedTasks.js";
import { getGreeting } from "../utils/getGreeting";
import { DAYS_OF_WEEK } from "../utils/constants";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [duplicatingRoutineId, setDuplicatingRoutineId] = useState(null);
  const [routineToDuplicate, setRoutineToDuplicate] = useState(null);
  const [duplicateTargetDay, setDuplicateTargetDay] = useState(DAYS_OF_WEEK[0]);

  const [moreTags, setmoreTags] = useState(false);
  const { tasks, loading: tasksLoading, updateTask: updateDbTask } = useTasks();
  const { updateTask, routineTasks } = useMixedTasks(updateDbTask);

  const today = new Date();

  const motivationalQuotes = [
    "Win the morning, win the day.",
    "Small progress is still progress.",
    "Discipline beats motivation.",
    "Push yourself, because no one else will.",
    "Stay consistent and trust the process.",
  ];

  const availableTags = [
    "React Learner",
    "Open Source Contributor",
    "Web Developer",
    "DSA Learner",
    "Designer",
    "Robotics Learner",
    "School Student",
    "College Student",
    "Tech Enthusiast",
    "Fitness Freak",
    "Gym Lover",
    "Cricket Fan",
    "Football Fan",
    "Music Lover",
    "Gamer",
    "Reader",
    "Artist",
    "Photographer",
    "Traveler",
    "Coffee Lover",
    "Night Owl",
    "Early Riser",
    "Problem Solver",
    "Team Player",
    "Fast Learner",
  ];

  const [selectedTags, setSelectedTags] = useState(() => {
    const saved = localStorage.getItem("selectedTags");
    return saved ? JSON.parse(saved) : [];
  });
  const [showTagModal, setShowTagModal] = useState(false);
  const [customTag, setCustomTag] = useState("");

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
    (task) => task.status === "Completed",
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
    (task) => task.status === "Completed",
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
    localStorage.setItem("selectedTags", JSON.stringify(selectedTags));
  }, [selectedTags]);

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
        { targetDay: duplicateTargetDay },
      );

      const duplicatedRoutine = res.data.routine || res.data.routines?.[0];

      if (duplicatedRoutine) {
        setSavedRoutines((prevRoutines) => [
          duplicatedRoutine,
          ...prevRoutines.filter(
            (routine) => routine._id !== duplicatedRoutine._id,
          ),
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
    <div className="min-h-screen w-full max-w-[1440px] mx-auto bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in transition-colors duration-300">
      <OnboardingModal />

      <header className="animate-in flex flex-col lg:flex-row items-center justify-between p-6 shadow-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-6">
        {moreTags ? (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-xs">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All Tags
                </span>
                <button
                  onClick={() => setmoreTags(false)}
                  className="text-rose-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <ul className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto list-none pl-0 mt-0">
                {selectedTags.map((tag) => (
                  <li
                    key={tag}
                    className="px-2.5 py-1 rounded-lg font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-300/30 dark:border-slate-700"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 flex-1 min-w-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#3b8ea0] to-[#4eb7b3] flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-md">
                {user?.photo ? (
                  <img
                    src={user?.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <LiveClock />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {getGreeting()}, {user?.name}
                </h1>
                <p className="text-sm italic font-medium text-[#3b8ea0] dark:text-[#4eb7b3] leading-relaxed">"{quote}"</p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase pt-0.5">
                  {new Date()
                    .toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                    })
                    .replace(",", " ·")}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
              <div className="flex flex-wrap justify-center gap-1.5">
                {selectedTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/60"
                  >
                    {tag}
                  </span>
                ))}

                {!moreTags && selectedTags.length > 3 && (
                  <button
                    onClick={() => setmoreTags(true)}
                    className="text-xs font-bold text-[#3b8ea0] hover:text-[#4eb7b3] transition-colors self-center px-1 cursor-pointer"
                  >
                    +{selectedTags.length - 3} More
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowTagModal(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                + Add Tags
              </button>
            </div>
          </>
        )}
      </header>

      {tasksLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="animate-in delay-100">
              <StatCard
                label="Today"
                value={`${completedToday} / ${totalToday}`}
                subtitle="Tasks done"
                icon={<CheckCircle2 size={20} />}
              />
            </div>
            <div className="animate-in delay-200">
              <StatCard
                label="This Week"
                value={`${weeklyCompletionPercent}%`}
                subtitle="Completion"
                icon={<Calendar size={20} />}
              />
            </div>
          </section>

          <ReflectionSummary
            completedToday={completedToday}
            totalToday={totalToday}
            weeklyCompletionPercent={weeklyCompletionPercent}
            tasks={tasks}
            upcomingTasks={upcomingTasks}
          />

          <div className="w-full animate-in delay-200">
            <ContributionHeatmap tasks={tasks} routineTasks={routineTasks} />
          </div>

          <div className="w-full animate-in delay-200">
            <DashboardTasks
              tasks={[...tasks, ...routineTasks]}
              updateTask={updateTask}
            />
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-in delay-200">
            <div className="w-full animate-in delay-300">
              <TaskPreview tasks={upcomingTasks} updateTask={updateTask} />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-[360px] overflow-y-auto relative transition-colors duration-300 scrollbar-thin">
              <div className="flex justify-between items-center mb-5 shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Saved Routines
                  </h2>
                  <button
                    onClick={fetchRoutines}
                    disabled={loadingRoutines}
                    aria-label="Refresh routines"
                    className="p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw
                      size={14}
                      className={`${loadingRoutines ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
                <button
                  className="group flex gap-1.5 items-center px-4 py-2 rounded-lg bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-medium active:scale-95 transition-all duration-150 cursor-pointer"
                  onClick={() => navigate("/routine-builder")}
                >
                  Build
                  <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
                </button>
              </div>

              {loadingRoutines ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Loading routines…</p>
              ) : savedRoutines.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-12 font-medium italic">
                  No routines saved yet
                </p>
              ) : (
                <ul className="space-y-3 mt-0 pl-0 list-none">
                  {savedRoutines.map((routine) => (
                    <li
                      key={routine._id}
                      onClick={() => navigate("/routine-builder")}
                      className="border-l-4 border-[#3b8ea0] rounded-xl p-4 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-y border-r border-slate-200/60 dark:border-slate-800/80 shadow-xs transition-all duration-200 animate-in cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate pr-1">{routine.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDuplicateModal(routine);
                          }}
                          disabled={duplicatingRoutineId === routine._id}
                          aria-label={`Duplicate ${routine.name}`}
                          title="Duplicate routine"
                          className="shrink-0 rounded-xl p-2 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-[#3b8ea0] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      {routine.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic break-words">
                          {routine.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 uppercase tracking-wider">
                        {routine.items.length} tasks across{" "}
                        {new Set(routine.items.map((i) => i.day)).size} day(s)
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}

      {routineToDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm transition-all transform scale-100">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Duplicate Routine
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose the day for "{routineToDuplicate.name} (Copy)".
            </p>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Copy to
            </label>
            <select
              value={duplicateTargetDay}
              onChange={(e) => setDuplicateTargetDay(e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all cursor-pointer box-border"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {day}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                onClick={closeDuplicateModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                onClick={handleDuplicateRoutine}
                disabled={duplicatingRoutineId === routineToDuplicate._id}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {showTagModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4"
          onClick={() => setShowTagModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col justify-between overflow-hidden z-10 box-border transition-colors duration-300 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Tags</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1 py-1 max-h-[40vh] border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 scrollbar-thin">
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#3b8ea0] focus:ring-[#3b8ea0] accent-[#3b8ea0]"
                    onChange={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2 shrink-0">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Create custom tag..."
                className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
              />
              <button
                onClick={() => {
                  if (
                    customTag.trim() &&
                    !selectedTags.includes(customTag.trim())
                  ) {
                    setSelectedTags([...selectedTags, customTag.trim()]);
                    setCustomTag("");
                  }
                }}
                className="px-4 py-2 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                onClick={() => setShowTagModal(false)}
              >
                Save Tags Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}