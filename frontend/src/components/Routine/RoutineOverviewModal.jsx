import { useEffect, useState } from "react";
import { MoreVertical, Trash2, X, Calendar, Layers, Clock, Share2, Copy, Download, Loader2 } from "lucide-react";
import { exportRoutineToPDF, generateRoutineSummary } from "../../utils/routineExport.js";

export default function RoutineOverviewModal({
  routine,
  tasks,
  onClose,
  isRoutineStarted,
  handleStartRoutine,
  handleStopRoutine,
  handleDeleteRoutine,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      const shareUrl = `${window.location.origin}/share/routine/${routine._id}`;
      await navigator.clipboard.writeText(shareUrl);
      triggerToast("Share link copied!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy share link");
    }
  };

  const handleCopySummary = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      const summaryText = generateRoutineSummary(routine, tasks);
      await navigator.clipboard.writeText(summaryText);
      triggerToast("Routine summary copied!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy summary");
    }
  };

  const handleExportPDF = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      setIsExporting(true);
      await exportRoutineToPDF(routine, tasks);
      triggerToast("PDF generated!");
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const tasksByDay = routine.items.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    const taskInfo = tasks.find((t) => t._id === item.taskId);
    acc[item.day].push({
      ...item,
      title: taskInfo?.title || "Unknown Task",
    });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4 animate-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="rounded-2xl border border-soft bg-white dark:bg-[#1e293b] shadow-2xl px-5 py-4 min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-semibold text-main">{toastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl rounded-3xl p-6 bg-white dark:bg-[#1e293b] shadow-2xl border border-soft/50 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-soft/20">
          <div>
            <h2 className="text-2xl font-bold text-main">
              {routine.name}
            </h2>

            {routine.description && (
              <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed italic">
                {routine.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/40">
                <Layers size={12} />
                {routine.items.length} Tasks
              </span>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
                <Calendar size={12} />
                Routine Template
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative shrink-0">
            {/* 3-dot menu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="rounded-xl border border-soft p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-muted hover:text-main cursor-pointer"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute top-12 right-10 w-48 rounded-2xl border border-soft bg-white dark:bg-[#1e293b] shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium cursor-pointer"
                >
                  <Share2 size={16} />
                  Copy Share Link
                </button>
                <button
                  onClick={handleCopySummary}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium cursor-pointer"
                >
                  <Copy size={16} />
                  Copy Summary
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Export as PDF
                </button>
                <div className="border-t border-soft/20"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRoutine();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition font-medium cursor-pointer"
                >
                  <Trash2 size={16} />
                  Delete Routine
                </button>
              </div>
            )}

          

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-xl border border-soft p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-muted hover:text-main cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1 py-2 max-h-[50vh]">
          {Object.keys(tasksByDay).map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="text-base font-bold text-main uppercase tracking-wider border-l-4 border-[#4eb7b3] pl-2.5">
                {day}
              </h3>

              <div className="space-y-2.5 pl-3">
                {tasksByDay[day]
                  .sort((a, b) => a.startTime - b.startTime)
                  .map((task) => {
                    const hours = String(
                      Math.floor(task.startTime / 60)
                    ).padStart(2, "0");

                    const minutes = String(
                      task.startTime % 60
                    ).padStart(2, "0");

                    return (
                      <div
                        key={task.taskId}
                        className="rounded-2xl border border-soft/30 bg-slate-50 dark:bg-slate-800/30 p-4 hover:shadow-sm hover:border-soft/60 transition duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#4eb7b3] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-main truncate">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                                <Clock size={10} />
                                Active Task
                              </p>
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-main rounded-xl border border-soft/40 px-3 py-1 bg-white dark:bg-slate-800 shrink-0">
                            {hours}:{minutes}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-soft/20 shrink-0">
          {isRoutineStarted ? (
            <button
              className="w-full rounded-2xl py-3 bg-red-500 text-white font-semibold hover:bg-red-600 active:scale-[0.98] transition cursor-pointer shadow-sm"
              onClick={handleStopRoutine}
            >
              Stop Routine
            </button>
          ) : (
            <button
              className="btn btn-primary w-full rounded-2xl py-3 font-semibold hover-lift cursor-pointer"
              onClick={handleStartRoutine}
            >
              Start This Routine
            </button>
          )}
        </div>

      </div>
    </div>
  );
}