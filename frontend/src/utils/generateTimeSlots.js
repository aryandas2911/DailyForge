export const generateTimeSlots = (startTime, endTime, interval) => {
  const slots = [];

  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  while (start <= end) {
    slots.push(start.toTimeString().slice(0, 5));
    start.setMinutes(start.getMinutes() + interval);
  }

  return slots;
};
