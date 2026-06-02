import { useEffect, useMemo, useState } from "react";
import { Clock3, Copy, Pencil, Plus, Trash2, X } from "lucide-react";

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
const HOUR_SLOTS = TIME_SLOTS.slice(0, -1);
const START_MINUTES = 6 * 60;
const END_MINUTES = 22 * 60;
const TOTAL_MINUTES = END_MINUTES - START_MINUTES;
const EVENT_HEIGHT = 24;
const LANE_GAP = 6;
const ROW_VERTICAL_PADDING = 10;
const MIN_ROW_HEIGHT = 54;

const normalizeDay = (day) => String(day || "").trim().toLowerCase();

const minutesToLabel = (minutes) => {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const layoutWithLanes = (dayTasks) => {
  const sorted = [...dayTasks].sort((a, b) => a.startTime - b.startTime);
  const laneEndTimes = [];

  const withLanes = sorted.map((task) => {
    let lane = laneEndTimes.findIndex((endTime) => endTime <= task.startTime);
    if (lane === -1) {
      lane = laneEndTimes.length;
      laneEndTimes.push(task.startTime + task.duration);
    } else {
      laneEndTimes[lane] = task.startTime + task.duration;
    }
    return { ...task, lane };
  });

  return {
    tasks: withLanes,
    laneCount: Math.max(1, laneEndTimes.length),
  };
};

const getDaySequenceFromDate = (date) => {
  const start = new Date(date);
  const sequence = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + offset);

    sequence.push({
      day: nextDate.toLocaleDateString("en-US", { weekday: "long" }),
      dateLabel: nextDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isoDate: nextDate.toISOString().slice(0, 10),
      isToday: offset === 0,
    });
  }

  return sequence;
};

const getMinuteGeometry = (startTime, duration) => {
  const clampedStart = Math.max(START_MINUTES, Math.min(END_MINUTES, startTime));
  const clampedEnd = Math.max(clampedStart, Math.min(END_MINUTES, startTime + duration));
  const minutesFromStart = clampedStart - START_MINUTES;
  const durationMinutes = Math.max(1, clampedEnd - clampedStart);
  const leftPct = (minutesFromStart / TOTAL_MINUTES) * 100;
  const widthPct = (durationMinutes / TOTAL_MINUTES) * 100;

  return {
    leftPct,
    widthPct,
    snappedStart: clampedStart,
    snappedEnd: clampedEnd,
  };
};

/* ---------------- Weekly Grid ---------------- */
export default function WeeklyGrid({
  scheduledTasks,
  onAddRoutine,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  innerRef,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const timeoutId = window.setTimeout(() => {
      setCurrentDate(new Date());
    }, nextMidnight.getTime() - now.getTime());

    return () => window.clearTimeout(timeoutId);
  }, [currentDate]);

  const orderedDays = useMemo(() => getDaySequenceFromDate(currentDate), [currentDate]);

  const tasksByDay = useMemo(() => {
    const grouped = DAYS.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});

    scheduledTasks.forEach((task) => {
      const matchedDay = DAYS.find((day) => normalizeDay(day) === normalizeDay(task.day));
      if (matchedDay) {
        grouped[matchedDay].push(task);
      }
    });

    return grouped;
  }, [scheduledTasks]);

  const lanesByDay = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = layoutWithLanes(tasksByDay[day]);
      return acc;
    }, {});
  }, [tasksByDay]);

  const rowHeights = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      const dayLayout = lanesByDay[day] || { laneCount: 1 };
      acc[day] = Math.max(
        MIN_ROW_HEIGHT,
        (ROW_VERTICAL_PADDING * 2)
          + (dayLayout.laneCount * EVENT_HEIGHT)
          + (Math.max(dayLayout.laneCount - 1, 0) * LANE_GAP),
      );
      return acc;
    }, {});
  }, [lanesByDay]);

  const timelineGridCols = `repeat(${HOUR_SLOTS.length}, minmax(72px, 1fr))`;
  const timelineMinWidth = HOUR_SLOTS.length * 72;

  return (
    <div className="w-full animate-in" ref={innerRef}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-main">Weekly Schedule</h2>
        <button
          onClick={onAddRoutine}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={14} />
          Add Routine
        </button>
      </div>

      <div className="w-full pb-2">
        <div
          className="grid border border-soft/30 rounded-xl overflow-hidden bg-white/0"
          style={{ gridTemplateColumns: "minmax(88px, 120px) minmax(0, 1fr)" }}
        >
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider px-2 py-2 border-r border-b border-soft/30 bg-white/5 dark:bg-slate-900/10">
              Days
            </div>

            {orderedDays.map(({ day, dateLabel, isToday }) => (
              <div
                key={`${day}-${dateLabel}`}
                style={{ height: `${rowHeights[day]}px` }}
                className={`px-2 py-2 text-sm font-semibold text-main border-r border-b border-soft/30 ${isToday ? "bg-teal-500/10" : "bg-white/0"}`}
              >
                <div className="flex flex-col gap-0.5 leading-tight">
                  <span>{day}</span>
                  <span className="text-[11px] sm:text-[12px] font-medium text-muted whitespace-nowrap">{dateLabel}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto" style={{ minWidth: 0 }}>
            <div style={{ minWidth: `${timelineMinWidth}px` }}>
              <div
                className="grid border-b border-soft/30 bg-white/5 dark:bg-slate-900/10"
                style={{ gridTemplateColumns: timelineGridCols }}
              >
                {HOUR_SLOTS.map((time) => (
                  <div
                    key={time}
                    className="text-[11px] sm:text-xs text-muted font-medium text-center py-2 border-r border-soft/30 last:border-r-0"
                  >
                    {time}
                  </div>
                ))}
              </div>

              <div>
                {orderedDays.map(({ day, dateLabel, isToday }) => {
                  const dayLayout = lanesByDay[day];
                  const rowHeight = rowHeights[day];

                  return (
                    <div
                      key={`${day}-${dateLabel}`}
                      style={{ minWidth: `${timelineMinWidth}px` }}
                      className="border-b border-soft/30 last:border-b-0"
                    >
                      <div
                        className={`relative overflow-hidden ${isToday ? "bg-teal-500/5" : "bg-transparent"}`}
                        style={{ height: `${rowHeight}px` }}
                      >
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            display: "grid",
                            gridTemplateColumns: timelineGridCols,
                          }}
                        >
                          {HOUR_SLOTS.map((time) => (
                            <div key={time} className="h-full border-r border-soft/30 bg-transparent last:border-r-0" />
                          ))}
                        </div>

                        {dayLayout.tasks.map((event) => {
                          const { leftPct, widthPct, snappedStart, snappedEnd } = getMinuteGeometry(
                            event.startTime,
                            event.duration,
                          );

                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelectedEvent(event)}
                              className="absolute text-left rounded-md text-white px-2 py-1 leading-none transition-colors cursor-pointer"
                              style={{
                                left: `${leftPct}%`,
                                width: `${Math.max(widthPct, 1)}%`,
                                top: `${ROW_VERTICAL_PADDING + (event.lane * (EVENT_HEIGHT + LANE_GAP))}px`,
                                backgroundColor: event.color || "#0f766e",
                                height: `${EVENT_HEIGHT}px`,
                                boxSizing: "border-box",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                              }}
                              title={`${event.title} (${day}, ${dateLabel} | ${minutesToLabel(snappedStart)} - ${minutesToLabel(snappedEnd)})`}
                            >
                              <span className="block truncate text-[10px] sm:text-xs font-semibold leading-none">
                                {event.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-in">
          <div className="card card-primary w-full max-w-md animate-in delay-100">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-main">{selectedEvent.title}</h3>
                <p className="mt-1 text-xs text-muted flex items-center gap-1.5">
                  <Clock3 size={12} />
                  {selectedEvent.day} | {minutesToLabel(selectedEvent.startTime)} - {minutesToLabel(selectedEvent.startTime + selectedEvent.duration)}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-muted hover:text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onEditTask(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="btn btn-muted flex items-center justify-center gap-1.5"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  onDuplicateTask(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="btn btn-muted flex items-center justify-center gap-1.5"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <button
                onClick={() => {
                  onDeleteTask(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}