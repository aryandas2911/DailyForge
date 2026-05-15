export const checkOverlap = (tasks) => {
    for (let i = 0; i < tasks.length - 1; i++) {
        const curr = tasks[i];
        const next = tasks[i + 1];

        if (curr.endTime > next.startTime) {
            return true;
        }
    }
    return false;
};