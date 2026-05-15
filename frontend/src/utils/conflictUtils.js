export const overlaps = (a, b) => {
  const aDur = a.duration ?? 60;
  const bDur = b.duration ?? 60;
  return (
    a.day === b.day &&
    a.startTime < b.startTime + bDur &&
    b.startTime < a.startTime + aDur
  );
};

export const hasConflict = (newTask, existingTasks) =>
  existingTasks
    .filter((t) => t.taskId !== newTask.taskId)
    .some((t) => overlaps(t, newTask));