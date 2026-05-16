import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

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
function DroppableCell({ day, time, tasks, onUpdateTask, onDeleteTask }) {
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
      className={`glass-cell h-12 relative transition ${
        isOver ? "bg-sky-100/70" : ""
      }`}
      role="region"
      aria-label={`${day} at ${time} - Drop zone for scheduling tasks`}
    >
      {tasks.map((task) => (
        <div
          key={task.taskId}
          className="absolute inset-1 rounded-xl bg-[#4eb7b3]/85 backdrop-blur-xl
                     text-white text-xs font-medium
                     flex flex-col justify-center gap-1 shadow-lg animate-in px-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate">{task.title}</span>
            <button
              type="button"
              onClick={() => onDeleteTask(task.taskId, task.day)}
              className="icon-btn h-6 w-6 hover:bg-white/20"
              aria-label={`Remove ${task.title} from ${task.day}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <label className="flex items-center gap-1 text-[10px] text-white/90">
            <span>Duration</span>
            <input
              type="number"
              min="10"
              step="5"
              value={task.duration}
              onChange={(event) =>
                onUpdateTask(task.taskId, task.day, {
                  duration: Number(event.target.value),
                })
              }
              className="w-14 rounded-md bg-white/20 px-1 py-0.5 text-center text-white outline-none"
              aria-label={`Duration for ${task.title}`}
            />
            <span>m</span>
          </label>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({
  scheduledTasks,
  onSaveDay,
  onUpdateTask,
  onDeleteTask,
}) {
  return (
    <div className="card card-primary glass-panel overflow-x-auto animate-in">
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
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                tasks={scheduledTasks.filter(
                  (t) => t.day === day && t.startTime === timeToMinutes(time)
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
