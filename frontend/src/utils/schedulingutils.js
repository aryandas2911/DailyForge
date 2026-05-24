export function getPriorityValue(priority) {
  switch (priority) {
    case "High":
      return 3;

    case "Medium":
      return 2;

    case "Low":
      return 1;

    default:
      return 0;
  }
}
export function convertToMinutes(time) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

export function convertToTime(minutes) {
  const hrs = Math.floor(minutes / 60);

  const mins = minutes % 60;

  return `${String(hrs).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}`;
}
export function findFreeSlots(tasks) {
  const freeSlots = [];

  const sortedTasks = [...tasks].sort(
    (a, b) =>
      convertToMinutes(a.startTime) -
      convertToMinutes(b.startTime)
  );

  for (let i = 0; i < sortedTasks.length - 1; i++) {
    const currentEnd = convertToMinutes(
      sortedTasks[i].endTime
    );

    const nextStart = convertToMinutes(
      sortedTasks[i + 1].startTime
    );

    if (nextStart > currentEnd) {
      freeSlots.push({
        start: currentEnd,
        end: nextStart,
        duration: nextStart - currentEnd,
      });
    }
  }

  return freeSlots;
}
export function autoScheduleTasks(
  unscheduledTasks,
  scheduledTasks
) {
  const freeSlots = findFreeSlots(scheduledTasks);

  const sortedTasks = [...unscheduledTasks].sort(
    (a, b) => {
      return (
        getPriorityValue(b.priority) -
        getPriorityValue(a.priority)
      );
    }
  );

  const scheduled = [];

  for (const task of sortedTasks) {
    for (const slot of freeSlots) {
      if (slot.duration >= task.duration) {
        const start = slot.start;

        const end = start + task.duration;

        scheduled.push({
          ...task,
          startTime: convertToTime(start),
          endTime: convertToTime(end),
          isAutoScheduled: true,
        });

        slot.start = end;

        slot.duration =
          slot.end - slot.start;

        break;
      }
    }
  }

  return scheduled;
}