import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Save, HelpCircle } from "lucide-react";

/* ---------------- Constants ---------------- */
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* Convert HH:mm → minutes */
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/* Convert minutes → HH:mm */
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const normalizeDay = (day) => String(day || "").trim().toLowerCase();

/* ---------------- Droppable Cell ---------------- */
function DroppableCell({ day, time, tasks, onDeleteTask, activeTask, isRecommended }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}-${time}`,
    data: {
      day,
      startTime: timeToMinutes(time), 
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full min-h-[3.5rem] p-1.5 flex flex-col gap-1 transition duration-200 ${
        isOver 
          ? "bg-cyan-500/10 dark:bg-cyan-500/20" 
          : isRecommended && activeTask
            ? "bg-[#4eb7b3]/5 dark:bg-[#4eb7b3]/10 border border-dashed border-[#4eb7b3]/40"
            : "bg-white/40 dark:bg-slate-800/20 hover:bg-white/60 dark:hover:bg-slate-800/30"
      }`}
      role="region"
      aria-label={`${day} at ${time} - Drop zone for scheduling tasks`}
    >
      {tasks.map((task) => (
        <div
          key={task.taskId}
          className="group/item relative flex items-center justify-between gap-1.5 rounded-lg bg-[#4eb7b3] text-white text-[10px] sm:text-xs font-medium px-2 py-1 shadow-sm hover:bg-[#3b8ea0] transition-all animate-in"
        >
          <span className="truncate pr-3 leading-tight">{task.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevents drag from triggering
              onDeleteTask(task.taskId, task.day);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full 
             bg-red-500 text-white text-[9px] font-bold
             flex items-center justify-center
             shadow-sm opacity-0 group-hover/item:opacity-100 hover:bg-red-600 transition-all cursor-pointer border border-white/20"
            title="Remove scheduled task"
          >
            ×
          </button>
        </div>
      ))}

      {/* Ghost preview for recommended empty slot during drag */}
      {isRecommended && activeTask && tasks.length === 0 && (
        <div className="border border-dashed border-[#4eb7b3]/60 bg-[#4eb7b3]/15 text-[#3b8ea0] dark:text-[#4eb7b3] rounded-lg text-[9px] sm:text-xs font-medium px-2 py-1.5 flex items-center justify-between opacity-80 animate-pulse select-none">
          <span className="truncate pr-1">{activeTask.title}</span>
          <span className="text-[7px] sm:text-[8px] bg-[#4eb7b3]/20 px-1 py-0.5 rounded font-bold shrink-0">Suggested</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({ scheduledTasks, onSaveDay, onDeleteTask, innerRef, activeTask }) {
  const [timeIncrement, setTimeIncrement] = useState(60); // 60 min or 30 min snap increments

  /* Generate dynamic hourly or half-hourly slots */
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 6;
    while (hour <= 22) {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
      if (timeIncrement === 30 && hour < 22) {
        slots.push(`${String(hour).padStart(2, "0")}:30`);
      }
      hour++;
    }
    return slots;
  };

  const TIME_SLOTS = generateTimeSlots();

  /* Calculate smart recommendations for a specific day based on active dragging task */
  const getRecommendedSlots = (day) => {
    if (!activeTask) return [];

    const dayTasks = scheduledTasks.filter(
      (t) => normalizeDay(t.day) === normalizeDay(day)
    );
    const occupiedTimes = new Set(dayTasks.map((t) => t.startTime));
    const recommendations = [];

    for (const time of TIME_SLOTS) {
      const timeMin = timeToMinutes(time);
      if (!occupiedTimes.has(timeMin)) {
        let score = 100;
        const hr = Math.floor(timeMin / 60);

        // Boost slots between 09:00 and 17:00 (prime study/work hours)
        if (hr >= 9 && hr <= 17) score += 20;

        // Boost slots adjacent to already scheduled tasks (minimizing schedule fragmentation)
        const prevMin = timeMin - timeIncrement;
        const nextMin = timeMin + timeIncrement;
        if (occupiedTimes.has(prevMin) || occupiedTimes.has(nextMin)) {
          score += 15;
        }

        recommendations.push({ time, score });
      }
    }

    // Sort by score descending and return the top 2 recommended slots
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((r) => r.time);
  };

  return (
    <div className="card card-primary !pl-2.5 !pr-2.5 !py-3 animate-in" ref={innerRef}>
      {/* Grid Controls (Snap Settings & Info) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-6.5 pt-3">
        <h2 className="text-lg font-semibold text-main">Weekly Schedule</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Snap toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Grid Snap:</span>
            <div className="flex rounded-lg bg-soft/30 dark:bg-slate-800 p-0.5 border border-soft/60">
              <button
                onClick={() => setTimeIncrement(60)}
                className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition cursor-pointer ${
                  timeIncrement === 60 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400" 
                    : "text-muted hover:text-main"
                }`}
              >
                60 min
              </button>
              <button
                onClick={() => setTimeIncrement(30)}
                className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition cursor-pointer ${
                  timeIncrement === 30 
                    ? "bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400" 
                    : "text-muted hover:text-main"
                }`}
              >
                30 min
              </button>
            </div>
          </div>

          {/* AI Helper tool tip */}
          {activeTask && (
            <div className="flex items-center gap-1.5 bg-[#4eb7b3]/10 text-[#3b8ea0] dark:text-[#4eb7b3] px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium animate-pulse">
              <HelpCircle size={12} />
              <span>AI recommendations active</span>
            </div>
          )}
        </div>
      </div>

      <div
        className="grid w-full overflow-x-auto sm:overflow-visible"
        style={{
          gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))",
        }}
      >
        {/* ===== Save Buttons Row ===== */}
        <div /> {/* empty time column */}
        {DAYS.map((day) => (
          <div key={`save-${day}`} className="flex justify-center pb-2">
            <button
              onClick={() => onSaveDay(day)}
              title={`Save ${day} Routine`}
              className="flex items-center justify-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 px-2.5 py-1 text-[9px] sm:text-xs font-semibold cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:shadow-sm transition-all duration-200 hover-lift"
            >
              <Save size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        ))}
        {/* ===== Day Headers ===== */}
        <div className="border-b border-soft/30" />
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-xs sm:text-sm font-semibold text-main text-center pb-2 border-b border-soft/30 mb-2"
          >
            {/* Mobile short names */}
            <span className="sm:hidden">
              {day.slice(0, 3)}
            </span>
            {/* Desktop full names */}
            <span className="hidden sm:inline">
              {day}
            </span>
          </div>
        ))}
        {/* ===== Time Rows ===== */}
        {TIME_SLOTS.map((time) => {
          return (
            <div key={time} className="contents">
              {/* Time label */}
              <div className="flex items-start justify-end pt-2 pr-2.5 text-[10px] sm:text-xs text-muted font-medium">
                {time}
              </div>

              {/* Cells */}
              {DAYS.map((day, dayIndex) => {
                const recommendedTimes = getRecommendedSlots(day);
                const isRecommended = recommendedTimes.includes(time);

                return (
                  <div
                    key={`${day}-${time}`}
                    className={`min-w-0 border-b border-soft/20 border-r border-soft/20 ${
                      dayIndex === 0 ? "border-l border-soft/20" : ""
                    }`}
                  >
                    <DroppableCell
                      day={day}
                      time={time}
                      tasks={scheduledTasks.filter(
                        (t) =>
                          normalizeDay(t.day) === normalizeDay(day) &&
                          t.startTime === timeToMinutes(time)
                      )}
                      onDeleteTask={onDeleteTask}
                      activeTask={activeTask}
                      isRecommended={isRecommended}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
