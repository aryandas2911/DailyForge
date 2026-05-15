import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, Flame, ArrowRight } from "lucide-react";

import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import api from "../api/axios.js";
import useTasks from "../hooks/useTasks.js";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  const { tasks, updateTask } = useTasks();

  const today = new Date();

  const todayTasks = tasks.filter((task) => {
    const created = new Date(task.createdAt);
    return (
      today.getFullYear() === created.getFullYear() &&
      today.getMonth() === created.getMonth() &&
      today.getDate() === created.getDate()
    );
  });

  const completedToday = todayTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const totalToday = todayTasks.length;

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
        <div>
          <h1 className="text-2xl font-semibold text-main leading-tight">
            Good afternoon, {user?.name}
          </h1>
          <p className="text-sm text-muted mt-1">
            {new Date()
              .toLocaleDateString("en-US", {
                weekday: "long",
                day: "2-digit",
                month: "short",
              })
              .replace(",", " ·")}
          </p>
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
            value="72%"
            subtitle="Completion"
            icon={<Calendar size={20} />}
          />
        </div>
      </section>

      {/* Today's Tasks */}
      <div className="w-full animate-in delay-200">
        <DashboardTasks />
      </div>

      {/* Bottom Row: TaskPreview + Routines */}
      <section className="flex animate-in delay-200 flex-col lg:flex-row gap-6 w-full">
        {/* Upcoming Tasks */}
        <div className="flex-1 animate-in delay-300">
          <TaskPreview
              tasks={upcomingTasks}
              updateTask={updateTask}
          />
        </div>

        {/* Saved Routines */}
        <div className="flex-1 animate-in delay-300 flex flex-col bg-white/80 rounded-xl shadow-md p-4 h-74 overflow-y-auto relative">
          {/* Header with button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-main">Saved Routines</h2>
            <button
              className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer flex items-center gap-1"
              onClick={() => navigate("/routine-builder")}
            >
              Build
              <ArrowRight size={16} />
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
                <li key={routine._id} className="border border-soft rounded-lg p-2 bg-white/80 shadow-sm hover-lift animate-in">
                  <p className="font-medium text-main">{routine.name}</p>
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
    </div>
  );
}
