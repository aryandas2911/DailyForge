import { useDroppable } from "@dnd-kit/core";
import { Save } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

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
      className={`h-full min-h-[3.5rem] p-1.5 flex flex-col gap-1 transition duration-200 ${
        isOver 
          ? "bg-[#3b8ea0]/10 dark:bg-[#3b8ea0]/20" 
          : "bg-slate-50/40 dark:bg-slate-800/10 hover:bg-slate-50 dark:hover:bg-slate-800/30"
      }`}
      role="region"
      aria-label={`${day} at ${time} - Drop zone for scheduling tasks`}
    >
      {tasks.map((task) => (
        <div
          key={task.taskId}
          className="group/item relative flex items-center justify-between gap-1.5 rounded-lg bg-[#3b8ea0] text-white text-[10px] sm:text-xs font-semibold px-2 py-1.5 shadow-xs transition-all animate-in"
        >
          <span className="truncate pr-3 leading-tight">{task.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevents drag from triggering
              onDeleteTask(task.taskId, task.day, task.startTime);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs opacity-0 group-hover/item:opacity-100 hover:bg-rose-600 transition-all cursor-pointer border border-white/10"
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
export default function WeeklyGrid({ scheduledTasks, onSaveDay, onDeleteTask, innerRef, highlight }) {
  return (
    <div
      className={`card card-primary !pl-2.5 !pr-2.5 !py-3 animate-in transition-shadow duration-500 ${
        highlight ? "ring-2 ring-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.15)]" : ""
      }`}
      ref={innerRef}
    >
      <h2 className="text-lg font-semibold text-main mb-1 px-6.5 pt-3">Weekly Schedule</h2>
      {highlight ? (
        <p className="text-xs text-cyan-600 dark:text-cyan-400 px-6.5 mb-3 animate-pulse">
          Drag a task from your library onto the grid to start building a routine
        </p>
      ) : (
        <div className="mb-3" />
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <div
          className="grid min-w-[800px]"
          style={{
            gridTemplateColumns: "60px repeat(7, minmax(0, 1fr))",
          }}
        >
          <div />
          {DAYS.map((day) => (
            <div key={`save-${day}`} className="flex justify-center pb-4 px-1">
              <button
                onClick={() => onSaveDay(day)}
                title={`Save ${day} Routine`}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 text-[10px] sm:text-xs font-bold transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-[#3b8ea0] dark:hover:border-[#3b8ea0] hover:text-[#3b8ea0] dark:hover:text-white"
              >
                <Save size={12} />
                <span>Save</span>
              </button>
            </div>
          ))}

          <div className="border-b border-slate-200 dark:border-slate-800" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center pb-3 border-b border-slate-200 dark:border-slate-800"
            >
              <span>{day}</span>
            </div>
          ))}

          {TIME_SLOTS.map((time) => (
            <div key={time} className="contents">
              <div className="flex items-start justify-end h-full pt-3.5 pr-3 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wider select-none box-border">
                {time}
              </div>

              {DAYS.map((day, dayIndex) => (
                <div
                  key={`${day}-${time}`}
                  className={`min-w-0 border-b border-slate-100 dark:border-slate-800/60 border-r border-slate-100 dark:border-slate-800/60 ${
                    dayIndex === 0 ? "border-l border-slate-100 dark:border-slate-800/60" : ""
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
    </div>
  );
}