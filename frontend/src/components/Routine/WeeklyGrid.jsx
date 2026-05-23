import { useDroppable } from "@dnd-kit/core";
import { Save } from "lucide-react";

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

/* Generate hourly slots: 06:00 → 22:00 */
const generateTimeSlots = () => {
  const slots = [];
  let hour = 6;
  while (hour <= 22) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    hour++;
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const normalizeDay = (day) => String(day || "").trim().toLowerCase();

/* Convert HH:mm → minutes */
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/* ---------------- Droppable Cell ---------------- */
function DroppableCell({ day, time, tasks, onDeleteTask }) {
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
      className={`h-full min-h-[3rem] p-1.5 flex flex-col gap-1 transition duration-200 ${
        isOver 
          ? "bg-cyan-500/10 dark:bg-cyan-500/20" 
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
    </div>
  );
}

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({ scheduledTasks, onSaveDay, onDeleteTask, innerRef }) {
  return (
    <div className="card card-primary !pl-2.5 !pr-2.5 !py-3 animate-in" ref={innerRef}>
      <h2 className="text-lg font-semibold text-main mb-4 px-6.5 pt-3">Weekly Schedule</h2>

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
        {TIME_SLOTS.map((time) => (
          <div key={time} className="contents">
            {/* Time label */}
            <div className="flex items-start justify-end pt-2 pr-2.5 text-[10px] sm:text-xs text-muted font-medium">
              {time}
            </div>

            {/* Cells */}
            {DAYS.map((day, dayIndex) => (
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
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
