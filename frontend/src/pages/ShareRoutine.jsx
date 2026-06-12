import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, Layers, Download, Copy, ArrowLeft, Sparkles } from "lucide-react";
import api from "../api/axios.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { exportRoutineToPDF, generateRoutineSummary } from "../utils/routineExport.js";

export default function ShareRoutine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    const fetchPublicRoutine = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/routines/public/${id}`);
        if (res.data.success && res.data.routine) {
          setRoutine(res.data.routine);
        } else {
          setError("Routine not found or cannot be loaded.");
        }
      } catch (err) {
        console.error("Error loading public routine:", err);
        setError(err.response?.data?.message || "Failed to load the routine. It might not exist or the link is invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicRoutine();
  }, [id]);

  const handleCopySummary = async () => {
    if (!routine) return;
    try {
      const summaryText = generateRoutineSummary(routine, []);
      await navigator.clipboard.writeText(summaryText);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy summary:", err);
      alert("Failed to copy routine summary.");
    }
  };

  const handleExportPDF = async () => {
    if (!routine) return;
    try {
      setIsExporting(true);
      await exportRoutineToPDF(routine, []);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export routine as PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-xl">
          <h2 className="text-xl font-bold text-rose-500 mb-2">Failed to load routine</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || "The requested routine is unavailable."}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Go to DailyForge Login
          </button>
        </div>
      </div>
    );
  }

  const tasksByDay = routine.items.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push({
      ...item,
      title: item.taskId?.title || "Unknown Task",
    });
    return acc;
  }, {});

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const activeDays = days.filter(d => tasksByDay[d] && tasksByDay[d].length > 0);

  return (
    <div className="min-h-screen w-full max-w-[1000px] mx-auto bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-in pb-40 transition-colors duration-300">
      
      {showCopyToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl px-5 py-4 min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Summary Copied</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Routine text summary copied to clipboard.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="rounded-xl p-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            title="Go to Login"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#3b8ea0] dark:text-[#4eb7b3] uppercase tracking-widest">Shared via DailyForge</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">Public Routine View</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2 shadow-xs"
            title="Copy Text Summary"
          >
            <Copy size={15} className="text-slate-400 dark:text-slate-500" />
            <span>Copy Summary</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Download size={15} />
            <span>{isExporting ? "Exporting PDF..." : "Export as PDF"}</span>
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{routine.name}</h2>
            {routine.description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed max-w-2xl break-words">{routine.description}</p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500/60 mt-2 italic">No description provided.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Layers size={12} className="text-slate-400 dark:text-slate-500" />
              {routine.items.length} Tasks
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
              {activeDays.length} Active Days
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {activeDays.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center py-12">
            <p className="text-slate-400 dark:text-slate-500 italic font-medium">This routine does not contain any scheduled tasks.</p>
          </div>
        ) : (
          activeDays.map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-l-4 border-[#3b8ea0] pl-2.5">
                {day}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-3">
                {tasksByDay[day]
                  .sort((a, b) => a.startTime - b.startTime)
                  .map((task) => {
                    const hours = String(Math.floor(task.startTime / 60)).padStart(2, "0");
                    const minutes = String(task.startTime % 60).padStart(2, "0");
                    
                    return (
                      <div
                        key={task._id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-xs border-slate-200 dark:border-slate-800 transition duration-200 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#3b8ea0] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-1">{task.title}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                              <Clock size={10} />
                              {task.duration} minutes
                            </p>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 bg-slate-50 dark:bg-slate-800 shrink-0">
                          {hours}:{minutes}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl relative overflow-hidden p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs transition-colors duration-300">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#3b8ea0] dark:text-[#4eb7b3]">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Start Forging Your Day</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Like this routine template?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            Sign up for DailyForge to easily build weekly schedules, track your sustainability and burnout scores, and adapt your day to your energy.
          </p>
        </div>

        <button
          onClick={() => navigate("/signup")}
          className="w-full md:w-auto px-6 py-3 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white font-bold text-base rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
        >
          Create Free Account
        </button>
      </div>

    </div>
  );
}