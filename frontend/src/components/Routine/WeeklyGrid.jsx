import { useDroppable } from "@dnd-kit/core";

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
      className={`border-soft h-12 relative transition ${
        isOver ? "bg-blue-100" : "bg-white/70"
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
          <span>{task.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); //prevents drag from trigerring 
              onDeleteTask(task.taskId, day);
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
export default function WeeklyGrid({ scheduledTasks, onSaveDay , onDeleteTask }) {
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
                tasks={scheduledTasks.filter(
                  (t) => t.day === day && t.startTime === timeToMinutes(time)
                )}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
