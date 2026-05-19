import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, ArrowRight, Copy, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Chart Data Preparation
  const chartData = DAYS_OF_WEEK.map((day, index) => {
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + index);
    
    const dayTasks = weekTasks.filter(t => {
      if(!t.dueDate) return false;
      return new Date(t.dueDate).toDateString() === targetDate.toDateString();
    });
    
    return {
      name: day.substring(0, 3),
      completed: dayTasks.filter(t => t.status === "Completed").length,
      total: dayTasks.length
    };
  });

  const upcomingTasks = tasks
    .filter((task) => task.status !== "Completed")
    .slice(0, 4);

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
  useEffect(() => {

  const loadRoutineTasks = () => {

    const storedRoutineTasks = localStorage.getItem(
      "activeRoutineTasks"
    );

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
    <div className="min-h-screen w-full max-w-[1440px] mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in-slow">
      {/* Dynamic Hero Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col justify-between p-8 sm:p-10 shadow-2xl rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 border border-slate-700/50"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-heading tracking-tight drop-shadow-sm">
              {getGreeting()}{user?.name ? ", " : ""}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {user?.name?.split(' ')[0] || ""}
              </span>
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-xl leading-relaxed italic">
              "{quote}"
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md">
            <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
              {new Date().toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <LiveClock />
          </div>
        </div>
      </motion.header>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <div className="animate-in delay-100">
          <StatCard
            label="Today's Progress"
            value={`${completedToday} / ${totalToday}`}
            subtitle="Tasks completed"
            icon={<CheckCircle2 size={24} />}
          />
        </div>
        <div className="animate-in delay-200">
          <StatCard
            label="Weekly Completion"
            value={`${weeklyCompletionPercent}%`}
            subtitle="Of scheduled tasks"
            icon={<Calendar size={24} />}
          />
        </div>
        <div className="animate-in delay-300">
          <StatCard
            label="Active Routines"
            value={savedRoutines.length}
            subtitle="Configured in library"
            icon={<Activity size={24} />}
          />
        </div>
      </section>

      {/* Main Grid: Tasks & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-in delay-400">
        
        {/* Left Column: Today's Focus */}
        <div className="lg:col-span-1 flex flex-col">
          <DashboardTasks
              tasks={[...tasks, ...routineTasks]}
              updateTask={updateTask}
          />
        </div>

        {/* Right Column: Analytics & Routines */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Analytics Chart */}
          <div className="card glass-panel w-full h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-main font-heading tracking-tight mb-6">Weekly Productivity</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Upcoming Tasks */}
            <div className="flex flex-col h-full">
              <TaskPreview
                tasks={upcomingTasks}
                updateTask={updateTask}
              />
            </div>

            {/* Saved Routines */}
            <div className="card glass-panel flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-main font-heading tracking-tight">Saved Routines</h2>
                <button
                  className="group flex gap-2 items-center px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-slate-900 text-sm font-medium transition-all duration-300"
                  onClick={() => navigate("/routine-builder")}
                >
                  Build
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pb-2">
                {loadingRoutines ? (
                  <p className="text-sm font-medium text-muted flex h-full items-center justify-center">Loading routines…</p>
                ) : savedRoutines.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 glass rounded-xl border-dashed">
                    <p className="text-sm font-medium text-muted mb-4">No routines saved yet</p>
                    <button className="btn btn-primary shadow-lg shadow-primary/20" onClick={() => navigate("/routine-builder")}>Create Routine</button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {savedRoutines.map((routine) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={routine._id}
                        onClick={() => navigate("/routine-builder")}
                        className="group border-l-4 border-primary rounded-xl p-4 glass hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-3 relative z-10">
                          <p className="font-semibold text-main truncate">{routine.name}</p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openDuplicateModal(routine); }}
                            disabled={duplicatingRoutineId === routine._id}
                            className="shrink-0 rounded-lg p-2 text-muted hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition cursor-pointer"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        {routine.description && (
                          <p className="text-xs font-medium text-muted/80 mt-1 line-clamp-2 relative z-10">
                            {routine.description}
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-primary mt-3 uppercase tracking-wider relative z-10">
                          {routine.items.length} tasks · {new Set(routine.items.map((i) => i.day)).size} day(s)
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

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
