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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-xs px-4 animate-in">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl px-5 py-4 min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{toastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto flex flex-col justify-between transition-colors duration-300">
        <div>
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                {routine.name}
              </h2>

              {routine.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg leading-relaxed italic break-words">
                  {routine.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Layers size={12} className="text-slate-400 dark:text-slate-500" />
                  {routine.items.length} Tasks
                </span>

                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                  Routine Template
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative shrink-0 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                aria-label="Routine options"
                aria-haspopup="true"
                aria-expanded={showMenu}
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute top-12 right-0 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition font-medium cursor-pointer"
                  >
                    <Share2 size={16} className="text-slate-400 dark:text-slate-500" />
                    Copy Share Link
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition font-medium cursor-pointer"
                  >
                    <Copy size={16} className="text-slate-400 dark:text-slate-500" />
                    Copy Summary
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition font-medium cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <Download size={16} className="text-slate-400 dark:text-slate-500" />}
                    Export as PDF
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoutine();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition font-medium cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Delete Routine
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                aria-label="Close layout panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1 py-2 max-h-[50vh] scrollbar-thin">
          {Object.keys(tasksByDay).map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-l-4 border-[#3b8ea0] pl-2.5">
                {day}
              </h3>

              <div className="space-y-2.5 pl-3">
                {tasksByDay[day]
                  .sort((a, b) => a.startTime - b.startTime)
                  .map((task) => {
                    const hours = String(Math.floor(task.startTime / 60)).padStart(2, "0");
                    const minutes = String(task.startTime % 60).padStart(2, "0");

                    return (
                      <div
                        key={task.taskId}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-4 hover:shadow-xs transition duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#3b8ea0] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                                <Clock size={10} />
                                Active Task
                              </p>
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 bg-white dark:bg-slate-800 shrink-0">
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

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
          {isRoutineStarted ? (
            <button
              className="w-full rounded-xl py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-xs active:scale-[0.99] transition cursor-pointer"
              onClick={handleStopRoutine}
            >
              Stop Routine
            </button>
          ) : (
            <button
              className="w-full rounded-xl py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold shadow-xs active:scale-[0.99] transition cursor-pointer"
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