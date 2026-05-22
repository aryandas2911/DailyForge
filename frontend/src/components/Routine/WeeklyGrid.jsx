import { useState } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { Clock } from "lucide-react";

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

/* Convert minutes → HH:MM */
const minutesToTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

/* ---------------- Droppable Cell ---------------- */
function DroppableCell({ day, time, tasks, isDraggingActive }) {
function DroppableCell({ day, time, tasks , onDeleteTask}) {
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
      className={`h-12 relative transition-all duration-150 border-b border-r
        ${
          isOver
            ? "bg-[#d0f6e3] border-2 border-dashed border-[#4eb7b3] z-10"
            : isDraggingActive
            ? "bg-white/90 border-[#98e1d7]/60 hover:bg-[#d0f6e3]/40"
            : "bg-white/70 border-[#98e1d7]/30"
        }`}
      className={`border-soft h-12 relative transition ${
        isOver ? "bg-blue-100 dark:bg-blue-900/30" : "bg-white/70 dark:bg-slate-800/30"
      }`}
      role="region"
      aria-label={`${day} at ${time} - Drop zone for scheduling tasks`}
    >
      {/* Drop target hint */}
      {isOver && tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[#4eb7b3] text-[10px] font-semibold tracking-wide opacity-80 select-none">
            Drop here
          </span>
        </div>
      )}

      {tasks.map((task) => (
        <div
          key={task.taskId}
          className="absolute inset-1 rounded-lg shadow-sm animate-in
                     flex flex-col items-center justify-center px-1 overflow-hidden
                     border border-[#4eb7b3]/40"
          style={{ backgroundColor: "#4eb7b3" }}
        >
          <span className="text-white text-[9px] opacity-80 flex items-center gap-0.5 leading-none mb-0.5">
            <Clock size={8} />
            {minutesToTime(task.startTime)}
          </span>
          <span className="text-white text-[11px] font-medium truncate w-full text-center leading-tight">
            {task.title}
          </span>
          <span>{task.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); //prevents drag from trigerring 
              onDeleteTask(task.taskId, task.day);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
             bg-red-500 text-white text-xs font-bold
             flex items-center justify-center
             shadow-md hover:bg-red-600 transition-colors
             border border-white"
          >X</button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({ scheduledTasks, onSaveDay }) {
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  useDndMonitor({
    onDragStart: () => setIsDraggingActive(true),
    onDragEnd: () => setIsDraggingActive(false),
    onDragCancel: () => setIsDraggingActive(false),
  });

  return (
    <div
      className={`card card-primary overflow-x-auto animate-in transition-all duration-200
        ${isDraggingActive ? "ring-2 ring-[#98e1d7] ring-offset-2 shadow-lg" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-main">Weekly Schedule</h2>
        {isDraggingActive && (
          <span className="text-xs font-medium text-[#4eb7b3] bg-[#d0f6e3] px-2 py-1 rounded-full animate-in">
            Drop into any time slot
          </span>
        )}
      </div>
export default function WeeklyGrid({ scheduledTasks, onSaveDay , onDeleteTask }) {
  return (
    <div className="card card-primary !pl-2.5 !pr-2.5 !py-3 animate-in">
      <h2 className="text-lg font-semibold text-main mb-4 px-6.5 pt-3">Weekly Schedule</h2>

      <div
      className="grid w-full"
        style={{
          gridTemplateColumns: "34px repeat(7, minmax(0, 1fr))",
        }}
      >
        {/* ===== Save Buttons Row ===== */}
        <div /> {/* empty time column */}
        {DAYS.map((day) => (
          <div key={`save-${day}`} className="flex justify-center pb-2">
            <button
              onClick={() => onSaveDay(day)}
              className="btn btn-primary !px-2.25 !py-1.5 text-[9px] sm:text-xs cursor-pointer hover-lift"
            >
              Save
            </button>
          </div>
        ))}
        {/* ===== Day Headers ===== */}
        <div />
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-sm font-semibold text-main text-center pb-2 border-b-2 border-[#98e1d7]/50"
                        className="text-sm font-medium text-main text-center pb-2"
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
            <div className="flex items-start justify-end pt-2 pr-2 text-[9px] sm:text-xs text-muted">
              {time}
            </div>

            {/* Cells */}
            {DAYS.map((day) => (
                <div
              key={`${day}-${time}`}
              className="min-w-0"
            >
              <DroppableCell
                day={day}
                time={time}
                isDraggingActive={isDraggingActive}
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
