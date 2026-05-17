import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";

import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import api from "../api/axios.js";
import useTasks from "../hooks/useTasks.js";
import StreakCard from "../components/Dashboard/StreakCard";
import AchievementBadge from "../components/Dashboard/AchievementBadge";

import {
  calculateDashboardStats,
  getAchievements,
} from "../utils/streakUtils";

import { getGreeting } from "../utils/getGreeting.js";

export default function Dashboard() {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

import { getGreeting } from "../utils/getGreeting";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  const { tasks, updateTask } = useTasks();

  const today = new Date();

  // Today's tasks
 

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

  // Dashboard analytics
  const {
    completedToday,
    weeklyCompleted,
    streak,
  } = calculateDashboardStats(tasks);

  const achievements = getAchievements(tasks, streak);

  const totalToday = todayTasks.length;

  const weeklyPercentage = Math.min(
    Math.round((weeklyCompleted / 20) * 100),
    100
  );

  // Upcoming tasks
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

  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-6 py-8 space-y-8 animate-in">
      {/* Header */}
      <header className="animate-in flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 shadow-md rounded-xl bg-(--surface) gap-4">
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-main leading-tight">
            {greeting}, {user?.name}
          </h1>

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
            value={`${weeklyPercentage}%`}
            subtitle={`${weeklyCompleted} tasks completed`}
            icon={<Calendar size={20} />}
          />
        </div>
      </section>

      {/* Streak */}
      <div className="animate-in delay-200">
        <StreakCard streak={streak} />
      </div>

      {/* Today's Tasks */}
      <div className="w-full animate-in delay-200">
        <DashboardTasks tasks={tasks} updateTask={updateTask} />
      </div>

      {/* Achievements */}
      <section className="bg-white/80 rounded-xl shadow-md p-5 animate-in delay-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-main">
              Achievements
            </h2>

            <p className="text-sm text-muted mt-1">
              Productivity milestones unlocked
            </p>
          </div>

          <div className="text-3xl">🏆</div>
        </div>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <AchievementBadge
                key={index}
                achievement={achievement}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            Complete tasks to unlock achievements
          </div>
        )}
      </section>

      {/* Bottom Row */}
      <section className="flex animate-in delay-200 flex-col lg:flex-row gap-6 w-full">
        {/* Upcoming Tasks */}
        <div className="flex-1 animate-in delay-300">
          <TaskPreview
            tasks={upcomingTasks}
            updateTask={updateTask}
          />
        </div>

        {/* Saved Routines */}
        <div className="card flex-1 animate-in delay-300 flex flex-col h-[340px] overflow-y-auto relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-main">
              Saved Routines
            </h2>

            <button
              className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer flex items-center gap-1"
              onClick={() => navigate("/routine-builder")}
            >
              Build
              <ArrowRight size={16} />
            </button>
          </div>

          {loadingRoutines ? (
            <p className="text-sm text-muted">
              Loading routines…
            </p>
          ) : savedRoutines.length === 0 ? (
            <p className="text-sm text-muted text-center mt-10">
              No routines saved yet
            </p>
          ) : (
            <ul className="space-y-3">
              {savedRoutines.map((routine) => (
                <li
                  key={routine._id}
                  className="border-l-4 border-primary rounded-xl p-4 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 animate-in"
                >
                  <p className="font-medium text-main">
                    {routine.name}
                  </p>

                  {routine.description && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 italic">
                      {routine.description}
                    </p>
                  )}

                  <p className="text-[10px] text-muted/80 mt-1 uppercase tracking-wider">
                    {routine.items.length} tasks across{" "}
                    {
                      new Set(
                        routine.items.map((i) => i.day)
                      ).size
                    }{" "}
                    day(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}