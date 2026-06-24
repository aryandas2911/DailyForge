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
      <div className="min-h-screen flex items-center justify-center app-bg">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center app-bg px-4 text-center">
        <div className="card max-w-md w-full p-8 border-red-500/20 bg-white dark:bg-[#1e293b] shadow-xl">
          <h2 className="text-xl font-bold text-red-500 mb-2">Failed to load routine</h2>
          <p className="text-sm text-muted mb-6">{error || "The requested routine is unavailable."}</p>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary w-full"
          >
            Go to DailyForge Login
          </button>
        </div>
      </div>
    );
  }

  // Group items by day
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
    <div className="min-h-screen w-full max-w-[1000px] mx-auto app-bg px-6 py-10 space-y-8 animate-in pb-40">
      
      {/* Toast Notification */}
      {showCopyToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="rounded-2xl border border-soft bg-white dark:bg-[#1e293b] shadow-2xl px-5 py-4 min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-semibold text-main">Summary Copied</p>
                <p className="text-xs text-muted mt-1">Routine text summary copied to clipboard.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg p-2 border border-soft text-muted hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
            title="Go to Login"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Shared via DailyForge</span>
            <h1 className="text-2xl font-bold text-main">Public Routine View</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="btn border border-soft hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2 text-sm text-main"
            title="Copy Text Summary"
          >
            <Copy size={15} />
            Copy Summary
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Download size={15} />
            {isExporting ? "Exporting PDF..." : "Export as PDF"}
          </button>
        </div>
      </header>

      {/* Routine Detail Card */}
      <div className="card border border-soft bg-white dark:bg-[#1e293b] p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-main">{routine.name}</h2>
            {routine.description ? (
              <p className="text-sm text-muted mt-2 italic leading-relaxed max-w-2xl">{routine.description}</p>
            ) : (
              <p className="text-sm text-muted/50 mt-2 italic">No description provided.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/40">
              <Layers size={12} />
              {routine.items.length} Tasks
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
              <Calendar size={12} />
              {activeDays.length} Active Days
            </span>
          </div>
        </div>
      </div>

      {/* Routine Timeline */}
      <div className="space-y-6">
        {activeDays.length === 0 ? (
          <div className="card text-center py-12 border border-soft/50">
            <p className="text-muted italic">This routine does not contain any scheduled tasks.</p>
          </div>
        ) : (
          activeDays.map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="text-base font-bold text-main uppercase tracking-wider border-l-4 border-[#4eb7b3] pl-2.5">
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
                        className="rounded-2xl border border-soft/30 bg-white dark:bg-slate-800/40 p-4 hover:shadow-md hover:border-soft/60 transition duration-200 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#4eb7b3] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-main truncate">{task.title}</p>
                            <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {task.duration} minutes
                            </p>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-main rounded-xl border border-soft/40 px-3 py-1 bg-slate-50 dark:bg-slate-800 shrink-0">
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

      {/* Call to Action Section */}
      <div className="card border-0 bg-gradient-to-br from-[#4eb7b3]/20 via-transparent to-transparent dark:from-[#1e2e30] relative overflow-hidden p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Start Forging Your Day</span>
          </div>
          <h3 className="text-xl font-bold text-main">Like this routine template?</h3>
          <p className="text-sm text-muted max-w-xl">
            Sign up for DailyForge to easily build weekly schedules, track your sustainability and burnout scores, and adapt your day to your energy.
          </p>
        </div>

        <button
          onClick={() => navigate("/signup")}
          className="btn btn-primary shrink-0 hover-lift w-full md:w-auto px-6 py-3 text-base"
        >
          Create Free Account
        </button>
      </div>

    </div>
  );
}
