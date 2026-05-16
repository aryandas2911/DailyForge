import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, Flame, ArrowRight } from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";

import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import DashboardRoutines from "../components/Dashboard/DashboardRoutines";
import useTaskStore from "../store/taskStore.js";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const tasksLoading = useTaskStore((state) => state.tasksLoading);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto app-bg px-6 py-8 space-y-8 animate-in">
      {/* Header */}
      <header className="animate-in flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 shadow-md rounded-xl bg-(--surface) gap-4">
         {/* Display time */}
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-main leading-tight">
            {
              new Date().getHours() < 12
                ? "Good morning"
                : new Date().getHours() < 18
                ? "Good afternoon"
                : "Good evening"
            }, {user?.name}
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
      </header>

      {/* Stats Row */}
      <section className="flex flex-col lg:flex-row gap-6 w-full">
        {tasksLoading ? (
          <>
            <div className="flex-1 h-24 bg-surface/50 animate-pulse rounded-xl" />
            <div className="flex-1 h-24 bg-surface/50 animate-pulse rounded-xl" />
          </>
        ) : (
          <>
            <div className="flex-1 animate-in delay-100">
              <StatCard
                type="today"
                label="Today"
                icon={<CheckCircle2 size={20} />}
              />
            </div>
            <div className="flex-1 animate-in delay-200">
              <StatCard
                type="week"
                label="This Week"
                icon={<Calendar size={20} />}
              />
            </div>
          </>
        )}
      </section>

      {/* Today's Tasks */}
      <div className="w-full animate-in delay-200">
        {tasksLoading ? (
          <div className="h-40 bg-surface/50 animate-pulse rounded-xl flex items-center justify-center">
            <p className="text-muted">Loading your tasks...</p>
          </div>
        ) : (
          <DashboardTasks />
        )}
      </div>

      {/* Bottom Row: TaskPreview + Routines */}
      <section className="flex animate-in delay-200 flex-col lg:flex-row gap-6 w-full">
        {/* Upcoming Tasks */}
        <div className="flex-1 animate-in delay-300">
          {tasksLoading ? (
            <div className="h-[340px] bg-surface/50 animate-pulse rounded-xl flex items-center justify-center">
              <p className="text-muted">Loading preview...</p>
            </div>
          ) : (
            <TaskPreview />
          )}
        </div>

        {/* Saved Routines */}
        <DashboardRoutines />
      </section>
    </div>
  );
}
