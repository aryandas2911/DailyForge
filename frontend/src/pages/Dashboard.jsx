import OnboardingModal from "../components/OnboardingModal";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, Flame, ArrowRight, RotateCw, Copy, BookOpen } from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";
import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import ReflectionSummary from "../components/Dashboard/ReflectionSummary";
import ContributionHeatmap from "../components/Dashboard/ContributionHeatmap";
import api from "../api/axios.js";
import { cachedGet, invalidate } from "../utils/apiCache";
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
  const [todayJournal, setTodayJournal] = useState(null);

  const today = new Date();

  //quotes array and random selection
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

  // Fetch routines
  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);
      const res = await cachedGet("/routines");
      setSavedRoutines(res.data.routines || []);
    } catch (err) {
      console.error(err);
      setSavedRoutines([]);
    } finally {
      setLoadingRoutines(false);
    }
  };

  const fetchTodayJournal = async () => {
    try {
      const todayStr = new Date().toLocaleDateString("en-CA");
      const res = await cachedGet(`/journal/by-date/${todayStr}`);
      if (res.data.success && res.data.journal) {
        setTodayJournal(res.data.journal);
      } else {
        setTodayJournal(null);
      }
    } catch (err) {
      console.error("Failed to fetch today's journal:", err);
      setTodayJournal(null);
    }
  };

  useEffect(() => {
    fetchRoutines();
    fetchTodayJournal();
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

      invalidate("/routines");

      // Optimistic UI update
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
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-6 py-8 space-y-8 animate-in">
      <OnboardingModal />

        {/* Get Started */}
        <section className="w-full animate-in delay-75">
    <div className="card p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/70 dark:bg-slate-900/60 shadow-sm">
       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
         <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                Getting Started
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-main">
               New here? Learn DailyForge in a few quick steps.
            </h2>
            <p className="mt-3 text-muted leading-relaxed">
              DailyForge helps you plan tasks, build routines, and track your progress in one place.
              Start with one task, set its priority, and use the dashboard to stay consistent.
           </p>
          </div>

      <button
        onClick={() => navigate("/tasks")}
        className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition"
      >
        Create your first task
      </button>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {[
        { title: "Add a task", desc: "Write down what you need to do." },
        { title: "Set priority", desc: "Mark what matters most first." },
        { title: "Build routine", desc: "Drag tasks into your weekly flow." },
        { title: "Track progress", desc: "See streaks and analytics over time." },
      ].map((item) => (
        <div
          key={item.title}
          className="rounded-2xl bg-white/60 dark:bg-slate-800/60 p-4 border border-white/10"
        >
          <h3 className="text-main font-semibold">{item.title}</h3>
          <p className="text-sm text-muted mt-1 leading-relaxed">{item.desc}</p>
        </div>
      ))}
      <h3 className="text-lg font-semibold text-main whitespace-nowrap">
        Want to know more about DailyForge and about its features?
        <a href="/About" className="text-primary hover:text-primary/80">
          About us
        </a>
      </h3>
    </div>
  </div>
</section>
      {/* Header */}
      <header className="animate-in flex flex-col lg:flex-row items-center p-6 shadow-md rounded-xl bg-[var(--surface)] gap-6">
        {moreTags ? (
          <div className="flex align-middle">
            <div
              className="align-middle mb-2 max-[64] p-3 z-50
                    bg-white dark:bg-slate-900 
                    border border-slate-200 dark:border-cyan-500/30 
                    rounded-lg shadow-xl text-xs"
            >
              {/* Header with Title and Cancel Button */}
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500 dark:text-slate-300">
                  All Tags
                </span>
                <button
                  onClick={() => setmoreTags(false)}
                  className="text-red-500 hover:text-red-400 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Tags List */}
              <ul className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto list-none pl-0">
                {selectedTags.map((tag) => (
                  <li
                    key={tag}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-cyan-500/15 text-slate-700 dark:text-cyan-400"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          // Open Fragment here to wrap Left, Middle, and Right columns
          <>
            {/* Left */}
            <div className="flex-1">
              <div
                className="
    w-20 h-20 
    rounded-full 
    overflow-hidden      
    bg-gradient-to-tr
    from-[#4eb7b3]
    to-[#98e1d7]
    flex items-center justify-center
    text-white text-3xl font-bold
    flex-shrink-0 "
              >
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

              <LiveClock />
              <h1 className="text-2xl font-semibold text-main leading-tight">
                {getGreeting()}, {user?.name}
              </h1>

              <p className="text-sm italic text-primary mt-1">"{quote}"</p>

              <p className="text-sm text-muted dark:text-slate-300 mt-2">
                {new Date()
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })
                  .replace(",", " ·")}
              </p>
            </div>

            {/* Middle */}
            <div className="relative flex flex-col items-baseline gap-3">
              {/* Preview Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                {selectedTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-5 py-2 rounded-full text-sm font-semibold
        bg-cyan-500/15 text-cyan-400
        border border-cyan-500/30"
                  >
                    {tag}
                  </span>
                ))}

                {/* Show 'More..' button only when list is closed and there are more than 3 tags */}
                {!moreTags && selectedTags.length > 3 && (
                  <button
                    onClick={() => setmoreTags(true)}
                    className="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors self-center"
                  >
                    +{selectedTags.length - 3} More..
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {tasksLoading ? (
        <LoadingSpinner />
      ) : (
        <>
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
            <div className="flex-1 animate-in delay-200 transition-none">
              <StatCard
                label="This Week"
                value={`${weeklyCompletionPercent}%`}
                subtitle="Completion"
                icon={<Calendar size={20} />}
              />
            </div>
          </section>

          {/* Daily Reflection Summary - placed below StatCards and above Today's Tasks */}
          <ReflectionSummary
            completedToday={completedToday}
            totalToday={totalToday}
            weeklyCompletionPercent={weeklyCompletionPercent}
            tasks={tasks}
            upcomingTasks={upcomingTasks}
          />
          {/* Contribution Heatmap */}
          <div className="w-full animate-in delay-200">
            <ContributionHeatmap tasks={tasks} routineTasks={routineTasks} />
          </div>

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

            {/* Saved Routines */}
            <div className="card flex-1 animate-in delay-300 flex flex-col h-[340px] overflow-y-auto relative">
              {/* Header with button */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-main">
                    Saved Routines
                  </h2>
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
                  className="group flex gap-2 self-center px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-80 active:scale-95 transition-all duration-150 cursor-pointer"
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
                      className="border-l-4 border-primary rounded-xl p-4 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-200 animate-in cursor-pointer hover-lift"
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

            {/* Daily Journal */}
            <div className="card animate-in delay-300 flex flex-col h-[340px] relative justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={20} className="text-primary" />
                      <h2 className="text-lg font-semibold text-main text-left">Daily Journal</h2>
                    </div>
                    {todayJournal && (
                      <span className="text-2xl" title={`Mood: ${todayJournal.mood}`}>
                        {todayJournal.mood === "happy" ? "😃" :
                          todayJournal.mood === "calm" ? "😌" :
                            todayJournal.mood === "neutral" ? "😐" :
                              todayJournal.mood === "stressed" ? "🤯" :
                                todayJournal.mood === "sad" ? "😢" :
                                  todayJournal.mood === "energetic" ? "⚡" : "😴"}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  {todayJournal ? (
                    <div className="space-y-2 text-left">
                      <h3 className="font-semibold text-main line-clamp-1">
                        {todayJournal.title || "Untitled Journal"}
                      </h3>
                      <p className="text-sm text-muted line-clamp-4 leading-relaxed">
                        {todayJournal.content}
                      </p>
                      {todayJournal.tags && todayJournal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {todayJournal.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4 text-left">
                      <p className="text-xs text-muted leading-relaxed">
                        No journal entry logged for today yet. Write down your wins, challenges, and learnings to keep track of your progress.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-2">
                  <button
                    className="group flex gap-2 w-full justify-center items-center px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-150 cursor-pointer"
                    onClick={() => navigate("/daily-journal")}
                  >
                    {todayJournal ? "Edit Today's Journal" : "Write Today's Entry"}
                    <ArrowRight className="transition-transform duration-150 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

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
      {showTagModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-10 z-50"
          onClick={() => setShowTagModal(false)}
        >
          <div
            className="bg-(--surface) p-6 rounded-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Select Tags</h3>

            <div className="space-y-2">
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  />

                  {tag}
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Create custom tag"
                className="flex-1 px-3 py-2 rounded-lg border dark:placeholder-slate-500"
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
                className="px-3 py-2 rounded-lg bg-(--primary) text-white"
              >
                Add
              </button>
            </div>

            <button
              className="mt-4 px-4 py-2 bg-(--primary) text-white rounded-lg"
              onClick={() => setShowTagModal(false)}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
