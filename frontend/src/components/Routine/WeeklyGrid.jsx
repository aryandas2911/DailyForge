import { useDroppable } from "@dnd-kit/core";
import { X, RotateCcw } from "lucide-react";

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
      className={`border-soft h-12 relative transition ${
        isOver ? "bg-blue-100 dark:bg-blue-900/30" : "bg-white/70 dark:bg-slate-800/30"
      }`}
      role="region"
      aria-label={`${day} at ${time} - Drop zone for scheduling tasks`}
    >
      {tasks.map((task) => (
        <div
          key={task.taskId}
          className="absolute inset-1 rounded-lg bg-blue-500
                     text-white text-xs font-medium
                     flex items-center justify-center shadow animate-in"
        >
                  <span className="truncate px-1">{task.title}</span>

                    {!task.isSaved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.taskId, day, task.startTime);
                      }}
                      className="absolute top-0.5 right-0.5 bg-white/20 hover:bg-white/40 
                                 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Remove task"
                    >
                      <X size={10} />
                    </button>
                  )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({
  scheduledTasks,
  onSaveDay,
  onDeleteTask,
  onClearDay,
  onClearWeek,
}) {
  return (
    <div className="card card-primary overflow-x-auto animate-in relative !pl-2.5 !pr-2.5 !py-3">
  <div className="flex items-center justify-between mb-4 px-6.5 pt-3">
    <h2 className="text-lg font-semibold text-main">Weekly Schedule</h2>

    <button
      onClick={onClearWeek}
      className="p-2 rounded-full text-[#66A5AD] hover:bg-[#66A5AD]/30 transition-colors cursor-pointer"
      title="Clear whole week"
    >
      <RotateCcw size={20} />
    </button>
  </div>
</div>

      <div
      className="grid w-full"
        style={{
          gridTemplateColumns: "34px repeat(7, minmax(0, 1fr))",
        }}
      >
        {/* ===== Save Buttons Row ===== */}
        <div /> {/* empty time column */}
        {DAYS.map((day) => (
          <div key={`save-${day}`} className="flex justify-center items-center gap-2 pb-2">
            <button
              onClick={() => onSaveDay(day)}
              className="btn btn-primary !px-2.25 !py-1.5 text-[9px] sm:text-xs cursor-pointer hover-lift"
            >
              Save
            </button>
            <button
              onClick={() => onClearDay(day)}
              className="p-1 rounded-full text-[#66A5AD] hover:bg-[#66A5AD]/30 transition-colors cursor-pointer"
              title={`Clear ${day}`}
            >
              <RotateCcw size={14} />
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
             
                tasks={scheduledTasks.filter(
                  (t) => t.day === day && t.startTime === timeToMinutes(time)
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
