import { useDroppable } from "@dnd-kit/core";
import { generateTimeSlots } from "../../utils/generateTimeSlots.js";
import { calculateSlotSpan } from "../../utils/slotCalculator.js";

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
const timeToMinutesLocal = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/* ---------------- Droppable Cell ---------------- */
function DroppableCell({ day, time, tasks, interval }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}-${time}`,
    data: {
      day,
      startTime: timeToMinutesLocal(time),
    },
  });

  // Calculate row span for the first task (if any)
  const task = tasks[0];
  const rowSpan = task && task.endTime
    ? calculateSlotSpan(task.startTime, task.endTime, interval)
    : 1;

  // Apply grid-row-span only if task spans multiple rows
  const cellStyle = rowSpan > 1
    ? { gridRow: `span ${rowSpan}` }
    : {};

  return (
    <div
      ref={setNodeRef}
      className={`border-soft h-12 relative transition ${
        isOver ? "bg-blue-100" : "bg-white/70"
      }`}
      style={cellStyle}
    >
      {task ? (
        <div
          className="absolute inset-1 rounded-lg bg-blue-500
                     text-white text-xs font-medium
                     flex items-center justify-center shadow animate-in"
        >
          {task.title}
        </div>
      ) : (
        tasks.map((t) => (
          <div
            key={t.taskId}
            className="absolute inset-1 rounded-lg bg-blue-500
                       text-white text-xs font-medium
                       flex items-center justify-center shadow animate-in"
          >
            {t.title}
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({ 
  scheduledTasks, 
  onSaveDay, 
  startTime = "06:00", 
  endTime = "22:00", 
  interval = 60 
}) {
  const TIME_SLOTS = generateTimeSlots(startTime, endTime, interval);

  return (
    <div className="card card-primary overflow-x-auto animate-in">
      <h2 className="text-lg font-semibold text-main mb-4">Weekly Schedule</h2>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "80px repeat(7, minmax(120px, 1fr))",
        }}
      >
        {/* ===== Save Buttons Row ===== */}
        <div /> {/* empty time column */}
        {DAYS.map((day) => (
          <div key={`save-${day}`} className="flex justify-center pb-2">
            <button
              onClick={() => onSaveDay(day)}
              className="btn btn-primary px-3 py-1 text-xs cursor-pointer hover-lift"
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
            className="text-sm font-medium text-main text-center pb-2"
          >
            {day}
          </div>
        ))}
        {/* ===== Time Rows ===== */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="contents">
            {/* Time label */}
            <div className="text-xs text-muted pr-2 pt-3 text-right">
              {time}
            </div>

            {/* Cells */}
            {DAYS.map((day) => (
              <DroppableCell
                key={`${day}-${time}`}
                day={day}
                time={time}
                interval={interval}
                tasks={scheduledTasks.filter(
                  (t) => t.day === day && t.startTime === timeToMinutesLocal(time)
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
