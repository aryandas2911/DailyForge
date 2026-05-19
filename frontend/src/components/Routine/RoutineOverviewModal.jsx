import { useEffect, useState } from "react";
import { MoreVertical, Trash2, X } from "lucide-react";

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

  useEffect(() => {

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };

  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm px-4 animate-in">
      <div className="card card-primary w-full max-w-2xl rounded-3xl p-6 animate-in delay-100 shadow-2xl border border-soft max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">

          <div>

            <h2 className="text-2xl font-semibold text-main">
              {routine.name}
            </h2>

            {routine.description && (
              <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">
                {routine.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4 text-xs text-muted">

              <span className="rounded-full bg-white/10 px-3 py-1 border border-soft">
                {routine.items.length} Tasks
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 border border-soft">
                Routine Template
              </span>

            </div>

          </div>

          <div className="flex items-center gap-2 relative">

            {/* 3-dot menu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="rounded-xl border border-soft p-2 hover:bg-white/10 transition"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute top-12 right-0 w-44 rounded-2xl border border-soft bg-white dark:bg-[#1e293b] shadow-xl overflow-hidden z-50 animate-in fade-in duration-200">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRoutine();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={16} />
                  Delete Routine
                </button>

              </div>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-xl border border-soft p-2 hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>

          </div>

        </div>

        {/* Timeline */}
        <div className="space-y-6">

          {Object.keys(tasksByDay).map((day) => (
            <div key={day}>

              <h3 className="text-lg font-semibold text-main mb-4">
                {day}
              </h3>

              <div className="space-y-3">

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
                        className="rounded-2xl border border-soft bg-white/5 p-4 hover:shadow-md transition"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="h-3 w-3 rounded-full bg-cyan-400" />

                            <div>

                              <p className="text-sm font-medium text-main">
                                {task.title}
                              </p>

                              <p className="text-xs text-muted mt-1">
                                Scheduled task
                              </p>

                            </div>

                          </div>

                          <div className="text-sm font-medium text-main rounded-xl border border-soft px-3 py-1 bg-white/5">
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
        <div className="mt-8 pt-4">

          {isRoutineStarted ? (

            <button
              className="w-full rounded-2xl py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition"
              onClick={handleStopRoutine}
            >
              Stop Routine
            </button>

          ) : (

            <button
              className="btn btn-primary w-full rounded-2xl py-3 hover-lift"
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