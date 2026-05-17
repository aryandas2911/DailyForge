export function getTaskEndMinutes(startTime, duration = 60) {
  return startTime + duration;
}

export function tasksOverlap(startA, durationA, startB, durationB) {
  const endA = getTaskEndMinutes(startA, durationA);
  const endB = getTaskEndMinutes(startB, durationB);
  return startA < endB && startB < endA;
}

export function findOverlappingTask(
  scheduledTasks,
  day,
  startTime,
  duration,
  excludeTaskId,
) {
  return scheduledTasks.find(
    (task) =>
      task.day === day &&
      task.taskId !== excludeTaskId &&
      tasksOverlap(
        startTime,
        duration,
        task.startTime,
        task.duration ?? 60,
      ),
  );
}
