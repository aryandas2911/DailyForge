import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle2, Calendar, Flame, ArrowRight } from "lucide-react";
import LiveClock from "../components/Dashboard/LiveClock";

import StatCard from "../components/Dashboard/StatCard";
import TaskPreview from "../components/Dashboard/TaskPreview";
import DashboardTasks from "../components/Dashboard/DashboardTasks";
import api from "../api/axios.js";
import useTasks from "../hooks/useTasks.js";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#BFE8D9] to-[#0B0F19]">



      {/* 🔥 MAIN DASHBOARD */}
      <div className="px-10 py-6">
        <div className="bg-[#0B1220]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/5">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl text-white font-semibold">Dashboard</h2>

            <div className="flex items-center gap-3 text-gray-300">
              <span>Welcome, Alex</span>
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold">
                A
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-6 mb-6">

            {/* TODAY */}
            <div className="bg-gradient-to-br from-[#111827] to-[#0B1220] p-5 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">Today</p>
              <h3 className="text-white text-2xl font-semibold mt-1">0 / 0</h3>
              <p className="text-gray-500 text-sm">Tasks completed</p>
            </div>

            {/* WEEK */}
            <div className="bg-gradient-to-br from-[#111827] to-[#0B1220] p-5 rounded-2xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">This Week</p>
                <h3 className="text-white text-2xl font-semibold mt-1">72%</h3>
                <p className="text-gray-500 text-sm">Completion rate</p>
              </div>
              <Calendar className="text-teal-400" />
            </div>

            {/* STREAK */}
            <div className="bg-gradient-to-br from-[#111827] to-[#0B1220] p-5 rounded-2xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <h3 className="text-white text-2xl font-semibold mt-1">5 days</h3>
                <p className="text-gray-500 text-sm">Keep it going!</p>
              </div>
              <Flame className="text-orange-400" />
            </div>

          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-3 gap-6">

            {/* TASKS */}
            <div className="col-span-2 bg-gradient-to-br from-[#111827] to-[#0B1220] rounded-2xl p-6 border border-white/5">
              
              <div className="flex justify-between mb-4">
                <h3 className="text-white font-semibold">Today's Tasks</h3>
                <span className="text-gray-400 text-sm">Wed May 13 2026</span>
              </div>

              <div className="flex flex-col items-center justify-center h-60 text-center">
                <CheckCircle2 className="text-teal-400 mb-3" size={40} />
                <p className="text-white font-medium">No tasks for today</p>
                <p className="text-gray-400 text-sm mt-1">
                  Enjoy your free day or add new tasks!
                </p>

                <button className="mt-4 bg-teal-500 hover:bg-teal-600 px-5 py-2 rounded-lg text-white">
                  + Add Task
                </button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-6">

              {/* ROUTINES */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0B1220] rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between mb-3">
                  <h3 className="text-white font-semibold">Routines</h3>
                  <button className="text-teal-400 text-sm">Build →</button>
                </div>

                <p className="text-gray-400 text-sm">
                  No routines yet. Create your first routine.
                </p>
              </div>

              {/* UPCOMING */}
              <div className="bg-gradient-to-br from-[#111827] to-[#0B1220] rounded-2xl p-5 border border-white/5">
                <h3 className="text-white font-semibold mb-2">Upcoming</h3>

                <p className="text-gray-400 text-sm">
                  No upcoming tasks. You're all caught up!
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}