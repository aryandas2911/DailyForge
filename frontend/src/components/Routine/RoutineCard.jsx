import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Trash2, Share2, Copy, Download, Loader2 } from "lucide-react";
import RoutineOverviewModal from "./RoutineOverviewModal";
import api from "../../api/axios.js";
import { exportRoutineToPDF, generateRoutineSummary } from "../../utils/routineExport.js";


export default function RoutineCard({
  routine,
  tasks,
  activeRoutine,
  setActiveRoutine,
  fetchRoutines,
}) {

  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showOverlapError, setShowOverlapError] = useState(false);
  const [toastTitle, setToastTitle] = useState("Routine Started");
  const [toastDesc, setToastDesc] = useState("Tasks were added to today's workflow.");
  const [isExporting, setIsExporting] = useState(false);

  const menuRef = useRef(null);

  const triggerToast = (title, desc) => {
    setToastTitle(title);
    setToastDesc(desc);
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
      triggerToast("Share Link Copied", "The public routine link was copied to clipboard.");
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
      triggerToast("Summary Copied", "The routine summary text was copied to clipboard.");
    } catch (err) {
      console.error(err);
      alert("Failed to copy routine summary");
    }
  };

  const handleExportPDF = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      setIsExporting(true);
      await exportRoutineToPDF(routine, tasks);
      triggerToast("PDF Downloaded", "The routine PDF was generated and downloaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to export routine as PDF");
    } finally {
      setIsExporting(false);
    }
  };


  const isRoutineStarted =
  activeRoutine.some(
    (active) =>
      String(active._id) === String(routine._id)
  );
  const tasksByDay = useMemo(() => {

    return routine.items.reduce((acc, item) => {

      if (!acc[item.day]) acc[item.day] = [];

      const taskInfo = tasks.find((t) => t._id === item.taskId);

      acc[item.day].push({
        ...item,
        title: taskInfo?.title || "Unknown Task",
      });

      return acc;

    }, {});

  }, [routine.items, tasks]);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  const hasOverlap = () => {

  if (!activeRoutine.length) {
    return false;
  }

  for (const activeRoutineItem of activeRoutine) {

    if (
      String(activeRoutineItem._id) ===
      String(routine._id)
    ) {
      continue;
    }

    for (const currentItem of routine.items) {

      for (const activeItem of activeRoutineItem.items) {

        if (currentItem.day !== activeItem.day) continue;

        const currentStart = currentItem.startTime;
        const currentEnd =
          currentItem.startTime + currentItem.duration;

        const activeStart = activeItem.startTime;
        const activeEnd =
          activeItem.startTime + activeItem.duration;

        const overlap =
          currentStart < activeEnd &&
          currentEnd > activeStart;

        if (overlap) {
          return true;
        }
      }
    }
  }

  return false;
};
 const handleStartRoutine = () => {

  if (hasOverlap()) {

  setShowOverlapError(true);

  setTimeout(() => {
    setShowOverlapError(false);
  }, 3000);

  return;
  }

  setActiveRoutine((prev) => [
    ...prev,
    routine
  ]);

  const existingRoutineIds = JSON.parse(
    localStorage.getItem("activeRoutineIds") || "[]"
  );

  localStorage.setItem(
    "activeRoutineIds",
    JSON.stringify([
      ...existingRoutineIds,
      routine._id
    ])
   );

  const formattedTasks = routine.items.map((item) => {

    const taskInfo = tasks.find(
      (t) => t._id === item.taskId
    );

    return {
      _id: `routine-${item.taskId}`,
      title: taskInfo?.title || "Unknown Task",
      priority: "Medium",
      dueDate: new Date().toISOString(),
      status: "Due",
      source: "routine",
      routineId: routine._id,
    };
  });

  const existingTasks = JSON.parse(
    localStorage.getItem("activeRoutineTasks") || "[]"
  );

  localStorage.setItem(
    "activeRoutineTasks",
    JSON.stringify([
      ...existingTasks,
      ...formattedTasks
    ])
  );

  triggerToast("Routine Started", "Tasks were added to today's workflow.");
};

 
  const handleStopRoutine = () => {

    setActiveRoutine((prev) =>
      prev.filter(
        (active) =>
          String(active._id) !== String(routine._id)
      )
    );
    const existingTasks = JSON.parse(
      localStorage.getItem("activeRoutineTasks") || "[]"
    );

    const updatedTasks = existingTasks.filter(
      (task) => 
        String(task.routineId) !== String(routine._id)
    );

    localStorage.setItem(
      "activeRoutineTasks",
      JSON.stringify(updatedTasks)
    );

    const existingRoutineIds = JSON.parse(
      localStorage.getItem("activeRoutineIds") || "[]"
    );

    const updatedRoutineIds =
      existingRoutineIds.filter(
        (id) => String(id) !== String(routine._id)
      );

    localStorage.setItem(
      "activeRoutineIds",
      JSON.stringify(updatedRoutineIds)
    );
  };

  const handleDeleteRoutine = async () => {

  try {
    console.log("DELETE CLICKED");
    await api.delete(
      `/routines/${routine._id}`
    );

    if (isRoutineStarted) {

      handleStopRoutine();
    }

    await fetchRoutines();

    setShowMenu(false);
    setIsOpen(false);

  } catch (err) {

    console.error(err);
    alert("Failed to delete routine");
  }
 };

  return (
    <>
{showOverlapError && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">

    <div className="rounded-2xl border border-red-500/20 bg-red-500 text-white shadow-2xl px-5 py-4 min-w-[320px]">

      <p className="text-sm font-semibold">
        Routine Overlap Detected
      </p>

      <p className="text-xs mt-1 text-white/80">
        This routine conflicts with another active routine.
      </p>

    </div>

  </div>
)}
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">

          <div className="rounded-2xl border border-soft bg-white dark:bg-[#1e293b] shadow-2xl px-5 py-4 min-w-[320px]">

            <div className="flex items-start gap-3">

              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />

              <div>
                <p className="text-sm font-semibold text-main">
                  {toastTitle}
                </p>

                <p className="text-xs text-muted mt-1">
                  {toastDesc}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* Card */}
      <div
        onClick={() => setIsOpen(true)}
        className={`relative card card-primary hover:shadow-lg transition-all p-5 cursor-pointer hover-lift border border-soft/50 bg-white dark:bg-[#1e293b] flex flex-col justify-between ${
          isRoutineStarted ? "ring-2 ring-[#4eb7b3] ring-offset-2 dark:ring-offset-slate-900" : ""
        }`}
      >
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-3 pr-8">
            <h3 className="font-semibold text-main text-base leading-snug">
              {routine.name}
            </h3>
            {isRoutineStarted && (
              <span className="shrink-0 rounded-full bg-[#d0f6e3] dark:bg-cyan-950/60 px-2 py-0.5 text-[10px] font-bold text-[#3b8ea0] dark:text-cyan-400 border border-[#98e1d7]/30">
                Active
              </span>
            )}
          </div>

          {routine.description && (
            <p className="text-xs text-muted mb-4 italic line-clamp-2">
              {routine.description}
            </p>
          )}

          <div className="space-y-3">
            {Object.keys(tasksByDay).map((day) => (
              <div key={day} className="border-t border-soft/20 pt-2.5 first:border-0 first:pt-0">
                <p className="text-xs font-bold text-main uppercase tracking-wider mb-1">
                  {day}
                </p>
                <ul className="space-y-1">
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
                        <li key={task.taskId} className="text-xs text-muted flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-main/80 shrink-0">{hours}:{minutes}</span>
                          <span className="text-main/50 shrink-0">•</span>
                          <span className="truncate">{task.title}</span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 3-dot menu absolute */}
        <div
          ref={menuRef}
          className="absolute top-4 right-4"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-muted hover:text-main"
            aria-label="Routine options"
            aria-haspopup="true"
            aria-expanded={showMenu}
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 rounded-2xl border border-soft bg-white dark:bg-[#1e293b] shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">
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

        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <RoutineOverviewModal
          routine={routine}
          tasks={tasks}
          onClose={() => setIsOpen(false)}
          isRoutineStarted={isRoutineStarted}
          handleStartRoutine={handleStartRoutine}
          handleStopRoutine={handleStopRoutine}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          handleDeleteRoutine={handleDeleteRoutine}
        />
      )}

    </>
  );
}